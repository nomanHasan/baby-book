/**
 * useBooks Hook - Book data management with TanStack Query integration
 */

import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { Book, BookFilters, PaginationParams, ServiceResponse } from '../types';
import { bookService } from '../services/bookService';

export interface UseBooksOptions {
  filters?: BookFilters;
  pagination?: PaginationParams;
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

export interface UseBooksReturn {
  books: Book[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isStale: boolean;
  isFetching: boolean;
}

export function useBooks(options: UseBooksOptions = {}): UseBooksReturn {
  const queryClient = useQueryClient();
  
  const queryKey = ['books', options.filters, options.pagination];
  
  const query: UseQueryResult<ServiceResponse<{ books: Book[]; total: number }>, Error> = useQuery({
    queryKey,
    queryFn: async () => {
      const startTime = performance.now();
      try {
        const result = await bookService.getAllBooks(options.filters, options.pagination);
        
        // Cache individual books for quick access
        if (result.data?.books) {
          result.data.books.forEach(book => {
            queryClient.setQueryData(['book', book.id], { data: book, loading: false });
          });
        }

        // Record performance metrics
        const loadTime = performance.now() - startTime;
        console.log(`Books loaded in ${loadTime.toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        console.error('Failed to load books:', error);
        throw error instanceof Error ? error : new Error('Failed to load books');
      }
    },
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    retry: (failureCount, error) => {
      if (failureCount < 3) {
        console.warn(`Retrying books fetch (${failureCount + 1}/3):`, error.message);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    books: query.data?.data?.books || [],
    total: query.data?.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isStale: query.isStale,
    isFetching: query.isFetching,
  };
}

export interface UseBookReturn {
  book: Book | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isStale: boolean;
}

export function useBook(bookId: string | undefined): UseBookReturn {
  const query: UseQueryResult<ServiceResponse<Book>, Error> = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) {
        throw new Error('Book ID is required');
      }
      
      const result = await bookService.getBookById(bookId);
      if (result.error) {
        throw result.error;
      }
      
      return result;
    },
    enabled: !!bookId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    book: query.data?.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isStale: query.isStale,
  };
}

export interface UseBookPagesReturn {
  pages: unknown[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBookPages(bookId: string | undefined): UseBookPagesReturn {
  const query: UseQueryResult<ServiceResponse<unknown[]>, Error> = useQuery({
    queryKey: ['book-pages', bookId],
    queryFn: async () => {
      if (!bookId) {
        throw new Error('Book ID is required');
      }
      
      const result = await bookService.getBookPages(bookId);
      if (result.error) {
        throw result.error;
      }
      
      return result;
    },
    enabled: !!bookId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    pages: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export interface UseBookSearchOptions {
  query?: string;
  tags?: string[];
  enabled?: boolean;
  debounceMs?: number;
}

export function useBookSearch(options: UseBookSearchOptions) {
  const { query, tags, enabled = true } = options;
  
  const searchQuery: UseQueryResult<ServiceResponse<Book[]>, Error> = useQuery({
    queryKey: ['book-search', query, tags],
    queryFn: async () => {
      if (!query && (!tags || tags.length === 0)) {
        return { data: [], loading: false };
      }
      
      const result = await bookService.searchBooks({
        query,
        tags,
        sortBy: 'dateModified',
        sortOrder: 'desc',
      });
      
      if (result.error) {
        throw result.error;
      }
      
      return result;
    },
    enabled: enabled && (!!query || (tags && tags.length > 0)),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return {
    results: searchQuery.data?.data || [],
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    refetch: searchQuery.refetch,
  };
}

export function useBookTags() {
  const query: UseQueryResult<ServiceResponse<string[]>, Error> = useQuery({
    queryKey: ['book-tags'],
    queryFn: async () => {
      const result = await bookService.getAllTags();
      if (result.error) {
        throw result.error;
      }
      return result;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  return {
    tags: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useBooksCache() {
  const queryClient = useQueryClient();
  
  const prefetchBook = async (bookId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['book', bookId],
      queryFn: async () => {
        const result = await bookService.getBookById(bookId);
        if (result.error) {
          throw result.error;
        }
        return result;
      },
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchBookPages = async (bookId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['book-pages', bookId],
      queryFn: async () => {
        const result = await bookService.getBookPages(bookId);
        if (result.error) {
          throw result.error;
        }
        return result;
      },
      staleTime: 15 * 60 * 1000,
    });
  };

  const invalidateBooks = () => {
    queryClient.invalidateQueries({ queryKey: ['books'] });
  };

  const invalidateBook = (bookId: string) => {
    queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    queryClient.invalidateQueries({ queryKey: ['book-pages', bookId] });
  };

  const getCachedBook = (bookId: string): Book | undefined => {
    const cached = queryClient.getQueryData(['book', bookId]) as ServiceResponse<Book> | undefined;
    return cached?.data;
  };

  const setCachedBook = (book: Book) => {
    queryClient.setQueryData(['book', book.id], { data: book, loading: false });
  };

  return {
    prefetchBook,
    prefetchBookPages,
    invalidateBooks,
    invalidateBook,
    getCachedBook,
    setCachedBook,
  };
}