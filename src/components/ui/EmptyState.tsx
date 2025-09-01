import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Heart } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No books yet",
  description = "Start your baby's memory journey by creating your first book of precious moments and milestones.",
  actionLabel = "Create Your First Book",
  actionLink = "/dev/book-creator",
  icon
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        className="mb-6 relative"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mb-4">
          {icon || <BookOpen className="w-10 h-10 text-primary-500" />}
        </div>
        <motion.div
          animate={{ 
            y: [-2, 2, -2],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -top-1 -right-1"
        >
          <Heart className="w-6 h-6 text-red-400" />
        </motion.div>
      </motion.div>

      <h2 className="text-2xl font-bold text-neutral-800 mb-3">
        {title}
      </h2>
      
      <p className="text-neutral-600 leading-relaxed mb-8 max-w-sm">
        {description}
      </p>

      {actionLink && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Link
            to={actionLink}
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={actionLabel}
          >
            <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
            {actionLabel}
          </Link>
        </motion.div>
      )}

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-200 rounded-full opacity-40"
        />
        <motion.div
          animate={{ 
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-secondary-300 rounded-full opacity-50"
        />
      </div>
    </motion.div>
  );
};

export default EmptyState;