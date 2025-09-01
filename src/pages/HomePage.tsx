import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Heart } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-16 h-16 text-primary-500 mr-4" />
            <Heart className="w-8 h-8 text-red-400 animate-bounce-gentle" />
          </div>
          <h1 className="text-5xl font-bold text-neutral-800 mb-4">
            Baby Book
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Create beautiful digital memories of your little one's precious
            moments. Capture photos, stories, and milestones in an interactive
            book that grows with your family.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
        >
          <Link
            to="/books"
            className="inline-flex items-center px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <BookOpen className="w-6 h-6 mr-2" />
            View My Books
          </Link>
          <Link
            to="/books/new"
            className="inline-flex items-center px-8 py-4 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-6 h-6 mr-2" />
            Create New Book
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          <div className="text-center p-6 bg-white/50 rounded-lg backdrop-blur">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              Capture Moments
            </h3>
            <p className="text-neutral-600">
              Add photos, videos, and voice recordings to preserve every
              precious memory.
            </p>
          </div>

          <div className="text-center p-6 bg-white/50 rounded-lg backdrop-blur">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              Tell Stories
            </h3>
            <p className="text-neutral-600">
              Write beautiful stories and notes to accompany your photos and
              create lasting memories.
            </p>
          </div>

          <div className="text-center p-6 bg-white/50 rounded-lg backdrop-blur">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              Track Milestones
            </h3>
            <p className="text-neutral-600">
              Document first steps, words, and special achievements as your
              baby grows.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;