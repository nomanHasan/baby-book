import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../stores/AppContext';
import BookCard from '../components/ui/BookCard';
import BookCardSkeleton from '../components/ui/BookCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import Breadcrumb from '../components/ui/Breadcrumb';
import { Book } from '../types';

const BookListPage: React.FC = () => {
  const { books, isLoading } = useApp();
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.metadata.babyName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredBooks(filtered);
  }, [books, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen p-4 sm:p-6 lg:p-8"
      >
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-primary-500 mr-3" />
                  <Heart className="w-5 h-5 text-red-400 animate-bounce-gentle" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800">
                    My Baby Books
                  </h1>
                  <p className="text-neutral-600 mt-1">
                    {isLoading ? 'Loading...' : `${filteredBooks.length} ${filteredBooks.length === 1 ? 'book' : 'books'}`}
                  </p>
                </div>
              </div>

              <Link
                to="/dev/book-creator"
                className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Book
              </Link>
            </div>

            {/* Search and Filter Bar */}
            {(books.length > 0 || searchQuery) && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search books by title, description, or baby name..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Filter className="w-5 h-5 mr-2 text-neutral-500" />
                  Filters
                </button>
              </div>
            )}
          </motion.div>

          {/* Content Area */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <BookCardSkeleton key={index} index={index} />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            searchQuery ? (
              <EmptyState
                title="No books found"
                description={`No books match your search for "${searchQuery}". Try adjusting your search terms or create a new book.`}
                actionLabel="Create New Book"
                actionLink="/dev/book-creator"
                icon={<Search className="w-10 h-10 text-primary-500" />}
              />
            ) : (
              <EmptyState />
            )
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </motion.div>
          )}

          {/* Search Results Info */}
          {searchQuery && filteredBooks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mt-8 text-center text-neutral-600"
            >
              Found {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} matching "{searchQuery}"
            </motion.div>
          )}
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default BookListPage;