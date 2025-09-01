/**
 * Services Export Index
 * Centralized exports for all data management services
 */

// Core Services
import { bookService } from './bookService';
import { imageService } from './imageService';  
import { cacheService } from './cacheService';

export { bookService, imageService, cacheService };

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