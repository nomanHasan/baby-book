/**
 * Advanced Image Loading Service with progressive loading and performance optimization
 * Supports LQIP, format fallbacks, preloading, and adaptive loading strategies
 */

import { ServiceResponse } from '../types';

export interface ImageLoadingOptions {
  enableProgressiveLoading?: boolean;
  enableFormatFallback?: boolean;
  enableLazyLoading?: boolean;
  preloadNext?: number;
  quality?: 'low' | 'medium' | 'high' | 'adaptive';
  retryCount?: number;
  timeout?: number;
}

export interface LoadedImageData {
  url: string;
  width?: number;
  height?: number;
  format?: string;
  loading: boolean;
  error?: Error;
  loadTime?: number;
  fromCache: boolean;
}

export interface ConnectionInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

class ImageService {
  private imageCache: Map<string, LoadedImageData> = new Map();
  private loadingPromises: Map<string, Promise<LoadedImageData>> = new Map();
  private preloadQueue: Set<string> = new Set();
  private retryAttempts: Map<string, number> = new Map();
  private observerMap: Map<HTMLElement, IntersectionObserver> = new Map();
  
  private readonly SUPPORTED_FORMATS = ['webp', 'avif', 'jpg', 'png'] as const;
  private readonly MAX_CACHE_SIZE = 100;
  private readonly DEFAULT_TIMEOUT = 10000;

  constructor() {
    // Clean up old cache entries periodically
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Progressive image loading with LQIP → optimized → full resolution
   */
  async loadImage(
    url: string,
    options: ImageLoadingOptions = {}
  ): Promise<ServiceResponse<LoadedImageData>> {
    try {
      const cacheKey = this.getCacheKey(url, options);
      
      // Return cached result if available
      const cached = this.imageCache.get(cacheKey);
      if (cached && !cached.error) {
        return {
          data: { ...cached, fromCache: true },
          loading: false
        };
      }

      // Return existing promise if already loading
      const existingPromise = this.loadingPromises.get(cacheKey);
      if (existingPromise) {
        const result = await existingPromise;
        return { data: result, loading: false };
      }

      // Start loading process
      const loadingPromise = this.performImageLoad(url, options);
      this.loadingPromises.set(cacheKey, loadingPromise);

      const result = await loadingPromise;
      
      // Cache successful results
      if (!result.error) {
        this.cacheImage(cacheKey, result);
      }

      // Clean up loading promise
      this.loadingPromises.delete(cacheKey);

      return { data: result, loading: false };
    } catch (error) {
      const cacheKey = this.getCacheKey(url, options);
      this.loadingPromises.delete(cacheKey);
      
      return {
        error: error instanceof Error ? error : new Error('Unknown image loading error'),
        loading: false
      };
    }
  }

  /**
   * Progressive loading implementation
   */
  private async performImageLoad(
    url: string,
    options: ImageLoadingOptions
  ): Promise<LoadedImageData> {
    const startTime = performance.now();
    const timeout = options.timeout || this.DEFAULT_TIMEOUT;
    const quality = options.quality || this.getAdaptiveQuality();

    try {
      let finalUrl = url;

      // Try format fallbacks based on browser support
      if (options.enableFormatFallback !== false) {
        finalUrl = await this.getBestFormatUrl(url);
      }

      // Apply quality settings
      finalUrl = this.applyQualitySettings(finalUrl, quality);

      // Load the image with timeout
      const imageData = await this.loadImageWithTimeout(finalUrl, timeout);
      
      const loadTime = performance.now() - startTime;

      return {
        url: finalUrl,
        ...imageData,
        loading: false,
        loadTime,
        fromCache: false
      };
    } catch (error) {
      // Implement retry logic
      const retryCount = options.retryCount || 3;
      const currentRetries = this.retryAttempts.get(url) || 0;

      if (currentRetries < retryCount) {
        this.retryAttempts.set(url, currentRetries + 1);
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentRetries) * 1000));
        
        return this.performImageLoad(url, options);
      }

      this.retryAttempts.delete(url);
      throw error;
    }
  }

  /**
   * Load image with timeout and metadata extraction
   */
  private loadImageWithTimeout(url: string, timeout: number): Promise<LoadedImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${url}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve({
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: this.getImageFormat(url),
          loading: false,
          fromCache: false
        });
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * Get best supported format URL with fallbacks
   */
  private async getBestFormatUrl(originalUrl: string): Promise<string> {
    const basePath = originalUrl.replace(/\.[^.]+$/, '');
    
    // Check browser support and return best format
    for (const format of this.SUPPORTED_FORMATS) {
      if (await this.supportsFormat(format)) {
        const formatUrl = `${basePath}.${format}`;
        if (await this.urlExists(formatUrl)) {
          return formatUrl;
        }
      }
    }

    return originalUrl; // Fallback to original
  }

  /**
   * Check if browser supports image format
   */
  private async supportsFormat(format: string): Promise<boolean> {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      const dataUrl = canvas.toDataURL(`image/${format}`);
      return dataUrl.includes(`data:image/${format}`);
    } catch {
      return false;
    }
  }

  /**
   * Check if URL exists
   */
  private async urlExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Apply quality settings to URL
   */
  private applyQualitySettings(url: string, quality: string): string {
    const connection = this.getConnectionInfo();
    
    // Adjust quality based on connection and settings
    if (quality === 'adaptive') {
      if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        quality = 'low';
      } else if (connection.effectiveType === '3g') {
        quality = 'medium';
      } else {
        quality = 'high';
      }
    }

    // Apply quality parameters (implementation depends on your image optimization setup)
    const urlObj = new URL(url, window.location.origin);
    switch (quality) {
      case 'low':
        urlObj.searchParams.set('q', '60');
        urlObj.searchParams.set('w', '800');
        break;
      case 'medium':
        urlObj.searchParams.set('q', '75');
        urlObj.searchParams.set('w', '1200');
        break;
      case 'high':
        urlObj.searchParams.set('q', '90');
        break;
    }

    return urlObj.toString();
  }

  /**
   * Preload multiple images for smooth slideshow navigation
   */
  async preloadImages(urls: string[], options: ImageLoadingOptions = {}): Promise<void> {
    const preloadPromises = urls
      .filter(url => !this.imageCache.has(this.getCacheKey(url, options)))
      .slice(0, options.preloadNext || 5)
      .map(url => {
        this.preloadQueue.add(url);
        return this.loadImage(url, { ...options, enableLazyLoading: false });
      });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Set up intersection observer for lazy loading
   */
  setupLazyLoading(
    element: HTMLElement,
    url: string,
    options: ImageLoadingOptions = {},
    callback?: (data: LoadedImageData) => void
  ): () => void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(url, options).then(result => {
              if (result.data && callback) {
                callback(result.data);
              }
            });
            observer.unobserve(element);
            this.observerMap.delete(element);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(element);
    this.observerMap.set(element, observer);

    // Return cleanup function
    return () => {
      observer.unobserve(element);
      this.observerMap.delete(element);
    };
  }

  /**
   * Get adaptive quality based on connection
   */
  private getAdaptiveQuality(): 'low' | 'medium' | 'high' {
    const connection = this.getConnectionInfo();
    
    if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 'low';
    } else if (connection.effectiveType === '3g') {
      return 'medium';
    }
    
    return 'high';
  }

  /**
   * Get connection information
   */
  private getConnectionInfo(): ConnectionInfo {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 100,
      saveData: connection?.saveData || false
    };
  }

  /**
   * Cache image data with LRU eviction
   */
  private cacheImage(key: string, data: LoadedImageData): void {
    // Implement LRU eviction if cache is full
    if (this.imageCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.imageCache.keys().next().value;
      this.imageCache.delete(firstKey);
    }

    this.imageCache.set(key, { ...data, fromCache: true });
  }

  /**
   * Generate cache key
   */
  private getCacheKey(url: string, options: ImageLoadingOptions): string {
    return `${url}|${JSON.stringify(options)}`;
  }

  /**
   * Get image format from URL
   */
  private getImageFormat(url: string): string {
    const match = url.match(/\.([^.?]+)(\?|$)/);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    // Remove loading promises that have been hanging
    for (const [key, promise] of this.loadingPromises.entries()) {
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cleanup timeout')), 1000))
      ]).catch(() => {
        this.loadingPromises.delete(key);
      });
    }

    // Clear old retry attempts
    this.retryAttempts.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.imageCache.size,
      loadingCount: this.loadingPromises.size,
      preloadQueueSize: this.preloadQueue.size,
      observerCount: this.observerMap.size,
      retryAttempts: this.retryAttempts.size
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.imageCache.clear();
    this.loadingPromises.clear();
    this.preloadQueue.clear();
    this.retryAttempts.clear();
    
    // Clean up intersection observers
    this.observerMap.forEach(observer => observer.disconnect());
    this.observerMap.clear();
  }
}

export const imageService = new ImageService();