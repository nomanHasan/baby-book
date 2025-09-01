/**
 * Performance Test for Data Services
 * Tests the data management system with simulated large datasets
 */

import { bookService } from './bookService';
import { imageService } from './imageService';
import { cacheService } from './cacheService';

// Mock manifest data for testing
const mockManifest = {
  books: Array.from({ length: 100 }, (_, i) => ({
    id: `book-${i + 1}`,
    title: `Baby Book ${i + 1}`,
    description: `A wonderful collection of memories for baby ${i + 1}`,
    totalPages: 20 + Math.floor(Math.random() * 30),
    lastModified: new Date().toISOString(),
    tags: [`family`, `baby`, `memories`],
    metadata: {
      babyName: `Baby ${i + 1}`,
      birthDate: '2024-01-01',
      parents: ['Mom', 'Dad']
    },
    coverImage: `/books/book-${i + 1}/cover.jpg`
  })),
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  totalBooks: 100
};

// Mock fetch for testing
(global as any).fetch = async (url: string) => {
  if (url.includes('books-manifest.json')) {
    return {
      ok: true,
      json: async () => mockManifest
    };
  }
  
  if (url.includes('/pages.json')) {
    return {
      ok: true,
      json: async () => Array.from({ length: 25 }, (_, i) => ({
        id: `page-${i + 1}`,
        title: `Page ${i + 1}`,
        content: `Content for page ${i + 1}`,
        images: Array.from({ length: 3 }, (_, j) => ({
          id: `img-${i + 1}-${j + 1}`,
          url: `/books/images/page-${i + 1}-${j + 1}.jpg`,
          caption: `Image ${j + 1}`
        }))
      }))
    };
  }
  
  throw new Error(`Mock fetch not implemented for ${url}`);
};

export async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests...');
  
  try {
    // Test 1: Book Service Performance
    console.log('\n📚 Testing Book Service...');
    const startTime = performance.now();
    
    const booksResult = await bookService.getAllBooks(
      { query: 'baby' },
      { page: 1, limit: 20, sortBy: 'title', sortOrder: 'asc' }
    );
    
    const loadTime = performance.now() - startTime;
    console.log(`✅ Loaded ${booksResult.data?.books.length || 0} books in ${loadTime.toFixed(2)}ms`);
    
    // Test 2: Individual book loading
    console.log('\n📖 Testing Individual Book Loading...');
    const bookStart = performance.now();
    
    const bookResult = await bookService.getBookById('book-1');
    const bookLoadTime = performance.now() - bookStart;
    
    console.log(`✅ Loaded book "${bookResult.data?.title}" in ${bookLoadTime.toFixed(2)}ms`);
    
    // Test 3: Cache Performance
    console.log('\n💾 Testing Cache Performance...');
    const cacheStart = performance.now();
    
    await cacheService.set('test-key', { data: 'test-value', timestamp: Date.now() });
    const cached = await cacheService.get('test-key');
    
    const cacheTime = performance.now() - cacheStart;
    console.log(`✅ Cache set/get completed in ${cacheTime.toFixed(2)}ms`);
    console.log(`📊 Cache hit: ${cached.data ? 'Yes' : 'No'}`);
    
    // Test 4: Image Service (mock)
    console.log('\n🖼️  Testing Image Service...');
    const imageStart = performance.now();
    
    const mockUrls = Array.from({ length: 10 }, (_, i) => `/images/test-${i + 1}.jpg`);
    await imageService.preloadImages(mockUrls, { quality: 'medium' });
    
    const imageTime = performance.now() - imageStart;
    console.log(`✅ Image preloading initiated for ${mockUrls.length} images in ${imageTime.toFixed(2)}ms`);
    
    // Test 5: Memory Usage
    console.log('\n📊 Performance Metrics:');
    const cacheStats = cacheService.getCacheMetrics();
    const imageStats = imageService.getCacheStats();
    
    console.log(`- Cache entries: ${cacheStats.cacheSize}`);
    console.log(`- Memory usage: ${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    console.log(`- Cache hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
    console.log(`- Image cache: ${imageStats.cacheSize} entries`);
    
    console.log('\n✨ Performance tests completed successfully!');
    
    return {
      success: true,
      metrics: {
        bookLoadTime: loadTime,
        individualBookTime: bookLoadTime,
        cacheTime,
        imageTime,
        cacheStats,
        imageStats
      }
    };
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export for use in other modules
export { mockManifest };