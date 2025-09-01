/**
 * Hooks Export Index
 * Centralized exports for all React hooks
 */

// Book Management Hooks
export {
  useBooks,
  useBook,
  useBookPages,
  useBookSearch,
  useBookTags,
  useBooksCache,
} from './useBooks';

export type {
  UseBooksOptions,
  UseBooksReturn,
  UseBookReturn,
  UseBookPagesReturn,
  UseBookSearchOptions,
} from './useBooks';

// Image Loading Hooks
export {
  useImageLoader,
  useImagePreloader,
  useImageCache,
} from './useImageLoader';

export type {
  UseImageLoaderOptions,
  UseImageLoaderReturn,
  UseImagePreloaderOptions,
} from './useImageLoader';

// Slideshow Hooks
export {
  useSlideshow,
  useImageSlideshow,
} from './useSlideshow';

export type {
  SlideshowItem,
  UseSlideshowOptions,
  UseSlideshowReturn,
  UseImageSlideshowOptions,
} from './useSlideshow';

// Gesture Hooks
export {
  useSwipeGestures,
  useSwipeNavigation,
  usePinchGesture,
} from './useSwipeGestures';

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