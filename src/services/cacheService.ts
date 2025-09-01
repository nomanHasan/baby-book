/**
 * Performance and Caching Strategy Service
 * Comprehensive caching with browser storage, service worker, and memory management
 */

import { CacheConfig, ServiceResponse } from '../types';

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  version?: string;
  size?: number;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  cacheSize: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface PerformanceMetrics {
  loadTimes: Record<string, number[]>;
  averageLoadTime: number;
  slowestOperations: Array<{ operation: string; time: number; timestamp: number }>;
  errorRate: number;
  totalOperations: number;
  totalErrors: number;
}

class CacheService {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private lruOrder: string[] = [];
  private maxMemorySize: number = 50 * 1024 * 1024; // 50MB
  private currentMemoryUsage: number = 0;
  private cacheMetrics: CacheMetrics = {
    hitRate: 0,
    missRate: 0,
    totalHits: 0,
    totalMisses: 0,
    cacheSize: 0,
    memoryUsage: 0,
    oldestEntry: 0,
    newestEntry: 0
  };
  private performanceMetrics: PerformanceMetrics = {
    loadTimes: {},
    averageLoadTime: 0,
    slowestOperations: [],
    errorRate: 0,
    totalOperations: 0,
    totalErrors: 0
  };
  // private serviceWorkerRegistration: ServiceWorkerRegistration | null = null; // TODO: Implement SW messaging

  constructor() {
    this.initializeServiceWorker();
    this.setupPerformanceMonitoring();
    this.startCleanupTimer();
  }

  /**
   * Initialize service worker for offline-first experience
   */
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const _registration = await navigator.serviceWorker.register('/sw.js');
        // this.serviceWorkerRegistration = registration; // TODO: Implement SW messaging
        console.log('Service Worker registered');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Set data in cache with TTL and size tracking
   */
  async set<T>(
    key: string,
    data: T,
    config: CacheConfig = { ttl: 30 * 60 * 1000, staleTime: 5 * 60 * 1000 }
  ): Promise<ServiceResponse<boolean>> {
    try {
      const serializedData = JSON.stringify(data);
      const size = new Blob([serializedData]).size;

      // Check if we need to free up memory
      if (this.currentMemoryUsage + size > this.maxMemorySize) {
        await this.evictLRU(size);
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: config.ttl,
        size
      };

      // Store in memory cache
      this.memoryCache.set(key, entry);
      this.updateLRU(key);
      this.currentMemoryUsage += size;

      // Store in localStorage with fallback handling
      try {
        localStorage.setItem(`bb-cache-${key}`, JSON.stringify(entry));
      } catch (storageError) {
        console.warn('localStorage full, continuing with memory cache only:', storageError);
      }

      // Store in IndexedDB for larger data
      if (size > 1024 * 1024) { // 1MB threshold
        await this.setIndexedDB(key, entry);
      }

      this.updateCacheMetrics();
      return { data: true, loading: false };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Cache set failed'),
        loading: false
      };
    }
  }

  /**
   * Get data from cache with stale-while-revalidate strategy
   */
  async get<T>(key: string): Promise<ServiceResponse<T | null>> {
    const startTime = performance.now();

    try {
      let entry: CacheEntry<T> | null = null;

      // Try memory cache first
      entry = (this.memoryCache.get(key) as CacheEntry<T>) || null;
      if (entry) {
        this.updateLRU(key);
        this.cacheMetrics.totalHits++;
      } else {
        // Try localStorage
        try {
          const stored = localStorage.getItem(`bb-cache-${key}`);
          if (stored) {
            entry = JSON.parse(stored) as CacheEntry<T>;
            // Restore to memory cache
            this.memoryCache.set(key, entry);
            this.updateLRU(key);
            this.cacheMetrics.totalHits++;
          }
        } catch (parseError) {
          console.warn('Failed to parse cached data:', parseError);
        }

        // Try IndexedDB for large data
        if (!entry) {
          entry = await this.getIndexedDB<T>(key);
          if (entry) {
            this.cacheMetrics.totalHits++;
          }
        }
      }

      if (!entry) {
        this.cacheMetrics.totalMisses++;
        this.recordPerformance('cache_miss', performance.now() - startTime);
        return { data: null, loading: false };
      }

      // Check if entry is expired
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        // Entry is expired, remove it
        await this.delete(key);
        this.cacheMetrics.totalMisses++;
        this.recordPerformance('cache_expired', performance.now() - startTime);
        return { data: null, loading: false };
      }

      this.recordPerformance('cache_hit', performance.now() - startTime);
      this.updateCacheMetrics();
      
      return { data: entry.data, loading: false };
    } catch (error) {
      this.performanceMetrics.totalErrors++;
      return {
        error: error instanceof Error ? error : new Error('Cache get failed'),
        loading: false
      };
    }
  }

  /**
   * Delete entry from all cache levels
   */
  async delete(key: string): Promise<ServiceResponse<boolean>> {
    try {
      const entry = this.memoryCache.get(key);
      if (entry?.size) {
        this.currentMemoryUsage -= entry.size;
      }

      this.memoryCache.delete(key);
      this.lruOrder = this.lruOrder.filter(k => k !== key);
      
      try {
        localStorage.removeItem(`bb-cache-${key}`);
      } catch (storageError) {
        console.warn('Failed to remove from localStorage:', storageError);
      }

      await this.deleteIndexedDB(key);
      this.updateCacheMetrics();

      return { data: true, loading: false };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Cache delete failed'),
        loading: false
      };
    }
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<ServiceResponse<boolean>> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      this.lruOrder = [];
      this.currentMemoryUsage = 0;

      // Clear localStorage entries
      const keys = Object.keys(localStorage).filter(key => key.startsWith('bb-cache-'));
      keys.forEach(key => localStorage.removeItem(key));

      // Clear IndexedDB
      await this.clearIndexedDB();

      this.updateCacheMetrics();
      return { data: true, loading: false };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Cache clear failed'),
        loading: false
      };
    }
  }

  /**
   * Implement LRU eviction strategy
   */
  private async evictLRU(requiredSpace: number): Promise<void> {
    while (this.currentMemoryUsage + requiredSpace > this.maxMemorySize && this.lruOrder.length > 0) {
      const oldestKey = this.lruOrder[0];
      await this.delete(oldestKey);
    }
  }

  /**
   * Update LRU order
   */
  private updateLRU(key: string): void {
    const existingIndex = this.lruOrder.indexOf(key);
    if (existingIndex !== -1) {
      this.lruOrder.splice(existingIndex, 1);
    }
    this.lruOrder.push(key);
  }

  /**
   * IndexedDB operations for large data
   */
  private async setIndexedDB(key: string, entry: CacheEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BabyBookCache', 1);
      
      request.onerror = () => reject(new Error('IndexedDB error'));
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const putRequest = store.put(entry, key);
        
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      };
    });
  }

  private async getIndexedDB<T>(key: string): Promise<CacheEntry<T> | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('BabyBookCache', 1);
      
      request.onerror = () => resolve(null); // Fail silently for IndexedDB
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const getRequest = store.get(key);
        
        getRequest.onerror = () => resolve(null);
        getRequest.onsuccess = () => resolve(getRequest.result || null);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      };
    });
  }

  private async deleteIndexedDB(key: string): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open('BabyBookCache', 1);
      
      request.onerror = () => resolve(); // Fail silently
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const deleteRequest = store.delete(key);
        
        deleteRequest.onerror = () => resolve();
        deleteRequest.onsuccess = () => resolve();
      };
    });
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open('BabyBookCache', 1);
      
      request.onerror = () => resolve();
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const clearRequest = store.clear();
        
        clearRequest.onerror = () => resolve();
        clearRequest.onsuccess = () => resolve();
      };
    });
  }

  /**
   * Performance monitoring setup
   */
  private setupPerformanceMonitoring(): void {
    // Monitor resource timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
            this.recordResourceTiming(entry as PerformanceResourceTiming);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['resource', 'navigation'] });
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }

  private recordResourceTiming(entry: PerformanceResourceTiming): void {
    const loadTime = entry.responseEnd - entry.requestStart;
    const operationType = entry.name.includes('image') ? 'image_load' : 'resource_load';
    
    this.recordPerformance(operationType, loadTime, {
      url: entry.name,
      size: entry.transferSize || 0,
      cached: entry.transferSize === 0
    });
  }

  /**
   * Record performance metrics
   */
  private recordPerformance(operation: string, time: number, _metadata?: unknown): void {
    if (!this.performanceMetrics.loadTimes[operation]) {
      this.performanceMetrics.loadTimes[operation] = [];
    }

    this.performanceMetrics.loadTimes[operation].push(time);
    this.performanceMetrics.totalOperations++;

    // Keep only last 100 measurements per operation
    if (this.performanceMetrics.loadTimes[operation].length > 100) {
      this.performanceMetrics.loadTimes[operation].shift();
    }

    // Track slowest operations
    this.performanceMetrics.slowestOperations.push({
      operation,
      time,
      timestamp: Date.now()
    });

    // Keep only top 10 slowest
    this.performanceMetrics.slowestOperations.sort((a, b) => b.time - a.time);
    this.performanceMetrics.slowestOperations = this.performanceMetrics.slowestOperations.slice(0, 10);

    // Update average load time
    const allTimes = Object.values(this.performanceMetrics.loadTimes).flat();
    this.performanceMetrics.averageLoadTime = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
  }

  /**
   * Update cache metrics
   */
  private updateCacheMetrics(): void {
    const total = this.cacheMetrics.totalHits + this.cacheMetrics.totalMisses;
    this.cacheMetrics.hitRate = total > 0 ? this.cacheMetrics.totalHits / total : 0;
    this.cacheMetrics.missRate = total > 0 ? this.cacheMetrics.totalMisses / total : 0;
    this.cacheMetrics.cacheSize = this.memoryCache.size;
    this.cacheMetrics.memoryUsage = this.currentMemoryUsage;

    if (this.memoryCache.size > 0) {
      const timestamps = Array.from(this.memoryCache.values()).map(entry => entry.timestamp);
      this.cacheMetrics.oldestEntry = Math.min(...timestamps);
      this.cacheMetrics.newestEntry = Math.max(...timestamps);
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up expired entries
   */
  private async cleanupExpiredEntries(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      await this.delete(key);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheMetrics(): CacheMetrics {
    this.updateCacheMetrics();
    return { ...this.cacheMetrics };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    this.performanceMetrics.errorRate = 
      this.performanceMetrics.totalOperations > 0 
        ? this.performanceMetrics.totalErrors / this.performanceMetrics.totalOperations 
        : 0;

    return { ...this.performanceMetrics };
  }

  /**
   * Preload critical resources
   */
  async preloadCriticalResources(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          await this.set(`preload-${url}`, data, { ttl: 60 * 60 * 1000, staleTime: 30 * 60 * 1000 });
        }
      } catch (error) {
        console.warn(`Failed to preload ${url}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }
}

export const cacheService = new CacheService();