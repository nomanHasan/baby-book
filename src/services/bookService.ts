/**
 * Book Service Layer - Comprehensive data management with caching
 * Provides typed functions for book operations with error handling and performance optimization
 */

import { Book, BookFilters, PaginationParams, ServiceResponse } from '../types';

export interface BooksManifest {
  books: {
    id: string;
    title: string;
    description: string;
    author?: string;
    coverImage?: string;
    totalPages: number;
    lastModified: string;
    tags: string[];
    metadata: {
      babyName?: string;
      birthDate?: string;
      parents?: string[];
    };
  }[];
  version: string;
  lastUpdated: string;
  totalBooks: number;
}

export interface BookSearchOptions {
  query?: string;
  tags?: string[];
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'title' | 'dateCreated' | 'dateModified' | 'author';
  sortOrder?: 'asc' | 'desc';
}

class BookService {
  private manifest: BooksManifest | null = null;
  private booksCache: Map<string, Book> = new Map();
  private manifestLastFetch: number = 0;
  private readonly MANIFEST_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly BOOKS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Load and parse books-manifest.json with full error handling
   */
  async loadManifest(force: boolean = false): Promise<ServiceResponse<BooksManifest>> {
    try {
      const now = Date.now();
      if (!force && this.manifest && (now - this.manifestLastFetch) < this.MANIFEST_CACHE_TTL) {
        return {
          data: this.manifest,
          loading: false
        };
      }

      const response = await fetch('/books-manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status} ${response.statusText}`);
      }

      const manifest: BooksManifest = await response.json();
      
      // Validate manifest structure
      if (!manifest.books || !Array.isArray(manifest.books)) {
        throw new Error('Invalid manifest format: missing or invalid books array');
      }

      // Validate each book entry
      manifest.books.forEach((book, index) => {
        if (!book.id || !book.title || typeof book.totalPages !== 'number') {
          throw new Error(`Invalid book entry at index ${index}: missing required fields`);
        }
      });

      this.manifest = manifest;
      this.manifestLastFetch = now;

      return {
        data: manifest,
        loading: false
      };
    } catch (error) {
      console.error('Failed to load books manifest:', error);
      return {
        error: error instanceof Error ? error : new Error('Unknown error loading manifest'),
        loading: false
      };
    }
  }

  /**
   * Get all books with optional filtering and pagination
   */
  async getAllBooks(
    filters?: BookFilters,
    pagination?: PaginationParams
  ): Promise<ServiceResponse<{ books: Book[]; total: number }>> {
    try {
      const manifestResult = await this.loadManifest();
      if (manifestResult.error || !manifestResult.data) {
        return {
          error: manifestResult.error || new Error('Failed to load manifest'),
          loading: false
        };
      }

      let filteredBooks = [...manifestResult.data.books];

      // Apply filters
      if (filters) {
        if (filters.query) {
          const query = filters.query.toLowerCase();
          filteredBooks = filteredBooks.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.description?.toLowerCase().includes(query) ||
            book.metadata?.babyName?.toLowerCase().includes(query)
          );
        }

        if (filters.tags && filters.tags.length > 0) {
          filteredBooks = filteredBooks.filter(book =>
            filters.tags!.some(tag => book.tags.includes(tag))
          );
        }

        if (filters.dateRange) {
          filteredBooks = filteredBooks.filter(book => {
            const bookDate = new Date(book.lastModified);
            return bookDate >= filters.dateRange!.start && bookDate <= filters.dateRange!.end;
          });
        }
      }

      // Apply sorting
      const sortBy = pagination?.sortBy || 'dateModified';
      const sortOrder = pagination?.sortOrder || 'desc';
      
      filteredBooks.sort((a, b) => {
        let aVal: string | number | Date;
        let bVal: string | number | Date;

        switch (sortBy) {
          case 'title':
            aVal = a.title;
            bVal = b.title;
            break;
          case 'dateCreated':
          case 'dateModified':
            aVal = new Date(a.lastModified);
            bVal = new Date(b.lastModified);
            break;
          default:
            aVal = a.title;
            bVal = b.title;
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      // Apply pagination
      const total = filteredBooks.length;
      if (pagination) {
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        filteredBooks = filteredBooks.slice(startIndex, endIndex);
      }

      // Convert manifest entries to full Book objects
      const books: Book[] = await Promise.all(
        filteredBooks.map(async (bookEntry) => {
          const cached = this.booksCache.get(bookEntry.id);
          if (cached) return cached;

          return {
            id: bookEntry.id,
            title: bookEntry.title,
            description: bookEntry.description,
            pages: [], // Pages loaded separately
            dateCreated: new Date(bookEntry.lastModified),
            dateModified: new Date(bookEntry.lastModified),
            isPublic: false,
            totalPages: bookEntry.totalPages,
            theme: {
              primaryColor: '#3B82F6',
              secondaryColor: '#10B981',
              fontFamily: 'Inter',
              pageStyle: 'modern' as const
            },
            metadata: {
              babyName: bookEntry.metadata?.babyName,
              birthDate: bookEntry.metadata?.birthDate ? new Date(bookEntry.metadata.birthDate) : undefined,
              parents: bookEntry.metadata?.parents || [],
              tags: bookEntry.tags || []
            },
            coverImage: bookEntry.coverImage ? {
              id: `${bookEntry.id}-cover`,
              type: 'image' as const,
              url: bookEntry.coverImage,
              uploadedAt: new Date(bookEntry.lastModified)
            } : undefined
          };
        })
      );

      return {
        data: { books, total },
        loading: false
      };
    } catch (error) {
      console.error('Failed to get all books:', error);
      return {
        error: error instanceof Error ? error : new Error('Unknown error getting books'),
        loading: false
      };
    }
  }

  /**
   * Get a specific book by ID with caching
   */
  async getBookById(bookId: string): Promise<ServiceResponse<Book>> {
    try {
      // Check cache first
      const cached = this.booksCache.get(bookId);
      if (cached) {
        return {
          data: cached,
          loading: false
        };
      }

      const manifestResult = await this.loadManifest();
      if (manifestResult.error || !manifestResult.data) {
        return {
          error: manifestResult.error || new Error('Failed to load manifest'),
          loading: false
        };
      }

      const bookEntry = manifestResult.data.books.find(book => book.id === bookId);
      if (!bookEntry) {
        return {
          error: new Error(`Book not found: ${bookId}`),
          loading: false
        };
      }

      // Load full book data
      const book: Book = {
        id: bookEntry.id,
        title: bookEntry.title,
        description: bookEntry.description,
        pages: [], // Pages loaded separately via getBookPages
        dateCreated: new Date(bookEntry.lastModified),
        dateModified: new Date(bookEntry.lastModified),
        isPublic: false,
        totalPages: bookEntry.totalPages,
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          fontFamily: 'Inter',
          pageStyle: 'modern' as const
        },
        metadata: {
          babyName: bookEntry.metadata?.babyName,
          birthDate: bookEntry.metadata?.birthDate ? new Date(bookEntry.metadata.birthDate) : undefined,
          parents: bookEntry.metadata?.parents || [],
          tags: bookEntry.tags || []
        },
        coverImage: bookEntry.coverImage ? {
          id: `${bookEntry.id}-cover`,
          type: 'image' as const,
          url: bookEntry.coverImage,
          uploadedAt: new Date(bookEntry.lastModified)
        } : undefined
      };

      // Cache the book
      this.booksCache.set(bookId, book);
      
      // Set up cache expiration
      setTimeout(() => {
        this.booksCache.delete(bookId);
      }, this.BOOKS_CACHE_TTL);

      return {
        data: book,
        loading: false
      };
    } catch (error) {
      console.error(`Failed to get book ${bookId}:`, error);
      return {
        error: error instanceof Error ? error : new Error('Unknown error getting book'),
        loading: false
      };
    }
  }

  /**
   * Get pages for a specific book
   */
  async getBookPages(bookId: string): Promise<ServiceResponse<unknown[]>> {
    try {
      const response = await fetch(`/books/${bookId}/pages.json`);
      if (!response.ok) {
        throw new Error(`Failed to load pages for book ${bookId}: ${response.status}`);
      }

      const pages = await response.json();
      return {
        data: pages,
        loading: false
      };
    } catch (error) {
      console.error(`Failed to get pages for book ${bookId}:`, error);
      return {
        error: error instanceof Error ? error : new Error('Unknown error getting pages'),
        loading: false
      };
    }
  }

  /**
   * Search across all books with advanced filtering
   */
  async searchBooks(options: BookSearchOptions): Promise<ServiceResponse<Book[]>> {
    const filters: BookFilters = {
      query: options.query,
      tags: options.tags,
      dateRange: options.dateRange
    };

    const pagination: PaginationParams = {
      page: 1,
      limit: 100,
      sortBy: options.sortBy || 'dateModified',
      sortOrder: options.sortOrder || 'desc'
    };

    const result = await this.getAllBooks(filters, pagination);
    if (result.error || !result.data) {
      return {
        error: result.error,
        loading: false
      };
    }

    return {
      data: result.data.books,
      loading: false
    };
  }

  /**
   * Get all unique tags across all books
   */
  async getAllTags(): Promise<ServiceResponse<string[]>> {
    try {
      const manifestResult = await this.loadManifest();
      if (manifestResult.error || !manifestResult.data) {
        return {
          error: manifestResult.error || new Error('Failed to load manifest'),
          loading: false
        };
      }

      const tagsSet = new Set<string>();
      manifestResult.data.books.forEach(book => {
        book.tags?.forEach(tag => tagsSet.add(tag));
      });

      return {
        data: Array.from(tagsSet).sort(),
        loading: false
      };
    } catch (error) {
      console.error('Failed to get all tags:', error);
      return {
        error: error instanceof Error ? error : new Error('Unknown error getting tags'),
        loading: false
      };
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.manifest = null;
    this.booksCache.clear();
    this.manifestLastFetch = 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      manifestCached: !!this.manifest,
      manifestAge: this.manifestLastFetch ? Date.now() - this.manifestLastFetch : 0,
      booksInCache: this.booksCache.size,
      cacheKeys: Array.from(this.booksCache.keys())
    };
  }
}

export const bookService = new BookService();