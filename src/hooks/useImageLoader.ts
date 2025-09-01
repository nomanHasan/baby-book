/**
 * useImageLoader Hook - Progressive image loading with performance optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { imageService, ImageLoadingOptions, LoadedImageData } from '../services/imageService';

export interface UseImageLoaderOptions extends ImageLoadingOptions {
  lazy?: boolean;
  placeholder?: string;
  onLoad?: (data: LoadedImageData) => void;
  onError?: (error: Error) => void;
}

export interface UseImageLoaderReturn {
  src: string | undefined;
  isLoading: boolean;
  error: Error | null;
  loadedData: LoadedImageData | null;
  retry: () => void;
  reload: () => void;
}

export function useImageLoader(
  url: string | undefined,
  options: UseImageLoaderOptions = {}
): UseImageLoaderReturn {
  const [src, setSrc] = useState<string | undefined>(options.placeholder);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadedData, setLoadedData] = useState<LoadedImageData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const elementRef = useRef<HTMLElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const loadImage = useCallback(async () => {
    if (!url) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await imageService.loadImage(url, {
        ...options,
        retryCount: options.retryCount || 3,
      });

      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        setSrc(result.data.url);
        setLoadedData(result.data);
        options.onLoad?.(result.data);
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Image loading failed');
      setError(errorObj);
      setSrc(options.placeholder);
      options.onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [url, options, retryCount]);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    loadImage();
  }, [loadImage]);

  const reload = useCallback(() => {
    setRetryCount(0);
    setSrc(options.placeholder);
    setLoadedData(null);
    setError(null);
    loadImage();
  }, [loadImage, options.placeholder]);

  useEffect(() => {
    if (!url) {
      setSrc(undefined);
      setLoadedData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (options.lazy && elementRef.current) {
      // Set up intersection observer for lazy loading
      const cleanup = imageService.setupLazyLoading(
        elementRef.current,
        url,
        options,
        (data) => {
          setSrc(data.url);
          setLoadedData(data);
          setIsLoading(false);
          options.onLoad?.(data);
        }
      );
      cleanupRef.current = cleanup;
      setIsLoading(true);
    } else {
      // Load immediately
      loadImage();
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [url, options.lazy, loadImage]);

  return {
    src,
    isLoading,
    error,
    loadedData,
    retry,
    reload,
  };
}

export interface UseImagePreloaderOptions {
  preloadNext?: number;
  quality?: 'low' | 'medium' | 'high' | 'adaptive';
}

export function useImagePreloader(
  urls: string[],
  options: UseImagePreloaderOptions = {}
): {
  preloadedCount: number;
  totalCount: number;
  isPreloading: boolean;
  preloadProgress: number;
} {
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    if (urls.length === 0) return;

    setIsPreloading(true);
    setPreloadedCount(0);

    const preloadImages = async () => {
      try {
        await imageService.preloadImages(urls.slice(0, options.preloadNext || 5), {
          quality: options.quality || 'adaptive',
          enableFormatFallback: true,
        });
        
        setPreloadedCount(Math.min(urls.length, options.preloadNext || 5));
      } catch (error) {
        console.warn('Image preloading failed:', error);
      } finally {
        setIsPreloading(false);
      }
    };

    preloadImages();
  }, [urls, options.preloadNext, options.quality]);

  return {
    preloadedCount,
    totalCount: urls.length,
    isPreloading,
    preloadProgress: urls.length > 0 ? preloadedCount / Math.min(urls.length, options.preloadNext || 5) : 0,
  };
}

export function useImageCache() {
  const getCacheStats = useCallback(() => {
    return imageService.getCacheStats();
  }, []);

  const clearCache = useCallback(() => {
    imageService.clearCache();
  }, []);

  const preloadImages = useCallback(async (urls: string[], options?: ImageLoadingOptions) => {
    await imageService.preloadImages(urls, options);
  }, []);

  return {
    getCacheStats,
    clearCache,
    preloadImages,
  };
}