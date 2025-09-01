/**
 * Services Export Index
 * Centralized exports for all data management services
 */

// Core Services
export { bookService } from './bookService';
export { imageService } from './imageService';
export { cacheService } from './cacheService';

// Types
export type {
  BooksManifest,
  BookSearchOptions
} from './bookService';

export type {
  ImageLoadingOptions,
  LoadedImageData,
  ConnectionInfo
} from './imageService';

export type {
  CacheEntry,
  CacheMetrics,
  PerformanceMetrics
} from './cacheService';

// Service instances for direct access
export const services = {
  book: bookService,
  image: imageService,
  cache: cacheService,
};