import React from 'react';
import { motion } from 'framer-motion';

interface BookCardSkeletonProps {
  index?: number;
}

const BookCardSkeleton: React.FC<BookCardSkeletonProps> = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
      }}
      className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden"
    >
      {/* Skeleton Cover Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-150 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
        
        {/* Skeleton Page Count Badge */}
        <div className="absolute top-3 right-3 bg-neutral-200 rounded-full px-2 py-1 animate-pulse">
          <div className="h-3 w-12 bg-neutral-300 rounded" />
        </div>
      </div>

      {/* Skeleton Book Details */}
      <div className="p-4 space-y-3">
        {/* Title and Description */}
        <div className="space-y-2">
          <div className="h-5 bg-neutral-200 rounded animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 bg-neutral-150 rounded w-full animate-pulse" />
            <div className="h-4 bg-neutral-150 rounded w-3/4 animate-pulse" />
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-neutral-200 rounded-full mr-1.5 animate-pulse" />
            <div className="h-3 bg-neutral-200 rounded w-20 animate-pulse" />
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-neutral-200 rounded-full mr-1.5 animate-pulse" />
            <div className="h-3 bg-neutral-200 rounded w-24 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCardSkeleton;