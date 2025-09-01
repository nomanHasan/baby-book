import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, User } from 'lucide-react';
import { Book } from '../../types';

interface BookCardProps {
  book: Book;
  index?: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, index = 0 }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
    >
      <Link
        to={`/book/${book.id}`}
        className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-neutral-100 hover:border-primary-200"
        aria-label={`View ${book.title} - Created ${formatDate(book.dateCreated)}`}
      >
        {/* Cover Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
          {book.coverImage ? (
            <img
              src={book.coverImage.url}
              alt={book.coverImage.altText || `Cover of ${book.title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
              <BookOpen 
                className="w-16 h-16 text-primary-400 group-hover:text-primary-500 transition-colors" 
                aria-hidden="true"
              />
            </div>
          )}
          
          {/* Page Count Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-neutral-700 shadow-sm">
            {book.totalPages} {book.totalPages === 1 ? 'page' : 'pages'}
          </div>
        </div>

        {/* Book Details */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-neutral-800 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
              {book.description || 'A collection of precious memories and moments.'}
            </p>
          </div>

          <div className="space-y-2">
            {/* Baby Name */}
            {book.metadata.babyName && (
              <div className="flex items-center text-xs text-neutral-500">
                <User className="w-3 h-3 mr-1.5 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{book.metadata.babyName}</span>
              </div>
            )}

            {/* Date Created */}
            <div className="flex items-center text-xs text-neutral-500">
              <Calendar className="w-3 h-3 mr-1.5 flex-shrink-0" aria-hidden="true" />
              <span>Created {formatDate(book.dateCreated)}</span>
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors duration-200 pointer-events-none" />
      </Link>
    </motion.div>
  );
};

export default BookCard;