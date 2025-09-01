/**
 * useSlideshow Hook - Advanced slideshow state management with preloading and gestures
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useImagePreloader } from './useImageLoader';

export interface SlideshowItem {
  id: string;
  url: string;
  caption?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface UseSlideshowOptions {
  items: SlideshowItem[];
  initialIndex?: number;
  autoPlay?: boolean;
  autoPlayDelay?: number;
  loop?: boolean;
  preloadCount?: number;
  enableKeyboard?: boolean;
  enableTouch?: boolean;
}

export interface UseSlideshowReturn {
  currentIndex: number;
  currentItem: SlideshowItem | null;
  isPlaying: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goToIndex: (index: number) => void;
  goNext: () => void;
  goPrevious: () => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  preloadProgress: number;
  isPreloading: boolean;
}

export function useSlideshow(options: UseSlideshowOptions): UseSlideshowReturn {
  const {
    items,
    initialIndex = 0,
    autoPlay = false,
    autoPlayDelay = 5000,
    loop = true,
    preloadCount = 5,
    enableKeyboard = true,
    // enableTouch = true, // TODO: Implement touch handling
  } = options;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = items[currentIndex] || null;
  const canGoNext = loop || currentIndex < items.length - 1;
  const canGoPrevious = loop || currentIndex > 0;

  // Preload images around current position
  const preloadUrls = items
    .slice(Math.max(0, currentIndex - 2), currentIndex + preloadCount)
    .map(item => item.url);
  
  const { preloadProgress, isPreloading } = useImagePreloader(preloadUrls, {
    preloadNext: preloadCount,
    quality: 'adaptive',
  });

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentIndex(index);
    } else if (loop) {
      if (index < 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex(0);
      }
    }
  }, [items.length, loop]);

  const goNext = useCallback(() => {
    goToIndex(currentIndex + 1);
  }, [currentIndex, goToIndex]);

  const goPrevious = useCallback(() => {
    goToIndex(currentIndex - 1);
  }, [currentIndex, goToIndex]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && items.length > 1) {
      intervalRef.current = setInterval(() => {
        goNext();
      }, autoPlayDelay) as NodeJS.Timeout;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, items.length, autoPlayDelay, goNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goPrevious();
          break;
        case 'Home':
          event.preventDefault();
          goToIndex(0);
          break;
        case 'End':
          event.preventDefault();
          goToIndex(items.length - 1);
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          toggle();
          break;
        case 'Escape':
          event.preventDefault();
          pause();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, goNext, goPrevious, goToIndex, toggle, pause, items.length]);

  return {
    currentIndex,
    currentItem,
    isPlaying,
    canGoNext,
    canGoPrevious,
    goToIndex,
    goNext,
    goPrevious,
    play,
    pause,
    toggle,
    preloadProgress,
    isPreloading,
  };
}

export interface UseImageSlideshowOptions extends UseSlideshowOptions {
  onImageLoad?: (index: number, data: unknown) => void;
  onImageError?: (index: number, error: Error) => void;
}

export function useImageSlideshow(options: UseImageSlideshowOptions) {
  const slideshowResult = useSlideshow(options);
  
  // Track loaded images
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Map<number, Error>>(new Map());

  const markImageLoaded = useCallback((index: number, data?: unknown) => {
    setLoadedImages(prev => new Set(prev).add(index));
    options.onImageLoad?.(index, data);
  }, [options]);

  const markImageError = useCallback((index: number, error: Error) => {
    setImageErrors(prev => new Map(prev).set(index, error));
    options.onImageError?.(index, error);
  }, [options]);

  return {
    ...slideshowResult,
    loadedImages: Array.from(loadedImages),
    imageErrors: Object.fromEntries(imageErrors),
    markImageLoaded,
    markImageError,
  };
}