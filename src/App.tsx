import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, User, AppSettings, DEFAULT_SETTINGS } from './types';
import { AppProvider } from './stores/AppContext';
import { ThemeProvider } from './stores/ThemeContext';
import { NotificationProvider } from './stores/NotificationContext';
import Layout from './components/layout/Layout';
import BookListPage from './pages/BookListPage';
import BookViewPage from './pages/BookViewPage';
import BookEditPage from './pages/BookEditPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Load saved settings
        const savedSettings = localStorage.getItem('baby-book-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
        }

        // Load books from manifest (processed books) or localStorage
        try {
          const manifestResponse = await fetch('/baby-book/books-manifest.json');
          if (manifestResponse.ok) {
            const manifest = await manifestResponse.json();
            const processedBooks: Book[] = manifest.books.map((book: any) => ({
              id: book.id,
              title: book.title,
              description: book.description || '',
              coverImage: book.coverImage ? {
                id: `cover-${book.id}`,
                type: 'image' as const,
                url: book.coverImage.src,
                thumbnailUrl: book.coverImage.srcSet?.webp?.split(' ')[0],
                altText: book.coverImage.alt || book.title,
                metadata: {
                  width: book.coverImage.width,
                  height: book.coverImage.height,
                },
                uploadedAt: new Date(),
              } : undefined,
              pages: book.pages.map((page: any, index: number) => ({
                id: page.id,
                bookId: book.id,
                title: page.title,
                content: page.description || '',
                media: page.image ? [{
                  id: `media-${page.id}`,
                  type: 'image' as const,
                  url: page.image.src,
                  thumbnailUrl: page.image.srcSet?.webp?.split(' ')[0],
                  altText: page.image.alt || page.title,
                  metadata: {
                    width: page.image.width,
                    height: page.image.height,
                  },
                  uploadedAt: new Date(),
                }] : [],
                dateCreated: new Date(),
                dateModified: new Date(),
                pageNumber: page.pageNumber || index + 1,
                layout: 'single-photo' as const,
                tags: [],
              })),
              dateCreated: new Date(),
              dateModified: new Date(),
              isPublic: false,
              totalPages: book.pages.length,
              theme: {
                primaryColor: '#3B82F6',
                secondaryColor: '#F59E0B',
                fontFamily: 'Inter',
                pageStyle: 'modern' as const,
              },
              metadata: {
                babyName: book.title,
                tags: [],
              },
            }));
            setBooks(processedBooks);
          } else {
            // Fallback to saved books in localStorage
            const savedBooks = localStorage.getItem('baby-book-books');
            if (savedBooks) {
              const parsedBooks = JSON.parse(savedBooks);
              setBooks(parsedBooks);
            }
          }
        } catch (err) {
          console.error('Failed to load books:', err);
          // Fallback to saved books in localStorage
          const savedBooks = localStorage.getItem('baby-book-books');
          if (savedBooks) {
            const parsedBooks = JSON.parse(savedBooks);
            setBooks(parsedBooks);
          }
        }

        // Last opened book will be handled in a separate useEffect

        // Simulate loading time for smooth UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (err) {
        setError('Failed to load application data');
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle last opened book after books are loaded
  useEffect(() => {
    if (books.length > 0) {
      const lastBookId = localStorage.getItem('baby-book-last-book');
      if (lastBookId) {
        const lastBook = books.find((book: Book) => book.id === lastBookId);
        if (lastBook) {
          setCurrentBook(lastBook);
        }
      }
    }
  }, [books]);

  const appContextValue = {
    books,
    setBooks,
    currentBook,
    setCurrentBook,
    user,
    setUser,
    settings,
    setSettings,
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Loading Baby Book
          </h2>
          <p className="text-neutral-600">
            Preparing your precious memories...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Reload App
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <AppProvider value={appContextValue}>
      <ThemeProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            <Layout>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<BookListPage />} />
                  <Route path="/book/:bookId" element={<BookViewPage />} />
                  <Route path="/book/:bookId/edit" element={<BookEditPage />} />
                  <Route path="/dev/book-creator" element={<BookEditPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </AnimatePresence>
            </Layout>
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;