/**
 * Hooks Export Index
 * Centralized exports for all React hooks
 */

// Book Management Hooks
import {
  useBooks,
  useBook,
  useBookPages,
  useBookSearch,
  useBookTags,
  useBooksCache,
} from './useBooks';

export {
  useBooks,
  useBook,
  useBookPages,
  useBookSearch,
  useBookTags,
  useBooksCache,
};

export type {
  UseBooksOptions,
  UseBooksReturn,
  UseBookReturn,
  UseBookPagesReturn,
  UseBookSearchOptions,
} from './useBooks';

// Image Loading Hooks
import {
  useImageLoader,
  useImagePreloader,
  useImageCache,
} from './useImageLoader';

export {
  useImageLoader,
  useImagePreloader,
  useImageCache,
};

export type {
  UseImageLoaderOptions,
  UseImageLoaderReturn,
  UseImagePreloaderOptions,
} from './useImageLoader';

// Slideshow Hooks
import {
  useSlideshow,
  useImageSlideshow,
} from './useSlideshow';

export {
  useSlideshow,
  useImageSlideshow,
};

export type {
  SlideshowItem,
  UseSlideshowOptions,
  UseSlideshowReturn,
  UseImageSlideshowOptions,
} from './useSlideshow';

// Gesture Hooks
import {
  useSwipeGestures,
  useSwipeNavigation,
  usePinchGesture,
} from './useSwipeGestures';

export {
  useSwipeGestures,
  useSwipeNavigation,
  usePinchGesture,
};

export type {
  SwipeGestureOptions,
  SwipeState,
  UseSwipeGesturesReturn,
  UseSwipeNavigationOptions,
  UsePinchGestureOptions,
} from './useSwipeGestures';

// Hook collections for easy access
export const bookHooks = {
  useBooks,
  useBook,
  useBookPages,
  useBookSearch,
  useBookTags,
  useBooksCache,
};

export const imageHooks = {
  useImageLoader,
  useImagePreloader,
  useImageCache,
};

export const interactionHooks = {
  useSlideshow,
  useImageSlideshow,
  useSwipeGestures,
  useSwipeNavigation,
  usePinchGesture,
};