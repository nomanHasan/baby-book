import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../stores/AppContext';
import { Book } from '../types';


const BookViewPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { books, settings, setSettings } = useApp();
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayInterval] = useState(3000);
  const [showControls, setShowControls] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [previousPageIndex, setPreviousPageIndex] = useState<number | null>(null);
  const [nextPageIndex, setNextPageIndex] = useState<number | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const enableSounds = settings.enableSounds;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TURN_DURATION_MS = prefersReducedMotion ? 200 : 650;
  const EASE_SCALE_TURN: [number, number, number, number] = [0.77, 0.0, 0.175, 1]; // easeInOutQuart
  const EASE_TRANSLATE_TURN: [number, number, number, number] = [0.33, 1, 0.68, 1]; // easeOutCubic feel

  useEffect(() => {
    if (bookId && books.length > 0) {
      const book = books.find((b: Book) => b.id === bookId);
      if (book) {
        setCurrentBook(book);
      } else {
        navigate('/404');
      }
    }
  }, [bookId, books, navigate]);

  const playPageTurnSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdAJJAf2j9+8pUGwo6nNvhpF0OBEWr2+XMeUcNI3fU8OOlZ0MRLNzv1JJAIxE5nuvgmV8PBDuj6vKoeFEWY4DV8t2MUBoBH4jV8OfNuFYUC5XP3Z5+SQkVKYDa3Z9QGgEfnvXdpEsOFI7V8d2QPwUQdcvz4pZJGgozlNfhpVEOBkir2+PNekkLK3rS69qXWBAOJpnO3qJQEgc7n97gqF0PBEij2+XNeUoOJ3rJ8NqVXBELJJvV3qdUEQcshOXuwmgiDTiR2OzLgGYZBzOJ1+e8Z0AJXrfn5b9RLwYqh8vmwGFGBSeh4veualEJNZzV5Z5wSgQcjdrjxGU5CTWZze2vZzIEHYTa5L9SNgcpidflvmlOBCCY1+mxY0MJNZ7P6ateLgUug9jnwmlRBSKR2+zLfGASEm/F8d2QQREUJqfh9baLSTQHOZPW4qFbGAoqhtvmunBUDBKX2+bDYUEHLIHa5bhiOAcx');
      audio.volume = 0.1;
      audio.play().catch(() => {});
    } catch (error) {
      // Ignore audio playback errors
    }
  };

  const handleNextPage = useCallback(() => {
    if (!currentBook || isTransitioning) return;
    
    const nextIndex = (currentPageIndex + 1) % currentBook.pages.length;
    
    if (nextIndex === 0 && autoPlay) {
      setAutoPlay(false);
    }
    
    setIsTransitioning(true);
    setDirection('next');
    setNextPageIndex(nextIndex);
    
    if (enableSounds) {
      playPageTurnSound();
    }
    
    setTimeout(() => {
      setCurrentPageIndex(nextIndex);
      setTimeout(() => {
        setIsTransitioning(false);
        setDirection(null);
        setNextPageIndex(null);
      }, 20);
    }, TURN_DURATION_MS);
  }, [currentBook, isTransitioning, currentPageIndex, autoPlay, enableSounds]);

  useEffect(() => {
    if (autoPlay && currentBook && currentBook.pages.length > 1) {
      // Start autoplay logic inline
      stopAutoPlay();
      setProgress(0);
      
      const progressStep = 100 / (autoPlayInterval / 50);
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            return 0;
          }
          return prev + progressStep;
        });
      }, 50);

      autoPlayTimerRef.current = setTimeout(() => {
        handleNextPage();
      }, autoPlayInterval);
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [autoPlay, currentPageIndex, autoPlayInterval, currentBook, handleNextPage]);

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(0);
  };

  const handlePrevPage = () => {
    if (!currentBook || isTransitioning) return;
    
    const prevIndex = currentPageIndex === 0 ? currentBook.pages.length - 1 : currentPageIndex - 1;
    
    setIsTransitioning(true);
    setDirection('prev');
    setPreviousPageIndex(prevIndex);
    
    if (enableSounds) {
      playPageTurnSound();
    }
    
    setTimeout(() => {
      setCurrentPageIndex(prevIndex);
      setTimeout(() => {
        setIsTransitioning(false);
        setDirection(null);
        setPreviousPageIndex(null);
      }, 20);
    }, TURN_DURATION_MS);
  };


  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => !isTransitioning && handleNextPage(),
    onSwipedRight: () => !isTransitioning && handlePrevPage(),
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
    delta: 10,
  });

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    if (autoPlay) {
      stopAutoPlay();
    }
  };

  const handleControlsVisibility = () => {
    setShowControls(!showControls);
    setTimeout(() => setShowControls(true), 3000);
  };

  const renderPageContent = (page: Book['pages'][0], animate: boolean = true) => (
    <>
      {page.media && page.media.length > 0 && (
        <div className="absolute inset-1 flex items-center justify-center pt-16 pb-16">
          <motion.img
            src={page.media[0].url}
            alt={page.media[0].altText || page.title}
            style={{
              height: 'fit-content',
              maxHeight: '100vh',
              borderRadius: '12px',
              inset: '0.25rem',
            }}
            className="w-full h-full object-contain"
            initial={animate ? { scale: 1.1, opacity: 0 } : {}}
            animate={animate ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
          />
        </div>
      )}
      
      <motion.div
        initial={animate ? { y: 20, opacity: 0 } : {}}
        animate={animate ? { y: 0, opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
        className="absolute bottom-20 left-4 right-4 z-30"
      >
        <div className="">
          <h2 className="text-lg font-bold text-white drop-shadow-lg">
            {page.title}
          </h2>
          <p className="text-xs text-white/80 mt-1 drop-shadow-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </motion.div>

      {page.content && (
        <motion.div
          initial={animate ? { x: 20, opacity: 0 } : {}}
          animate={animate ? { x: 0, opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30 max-w-xs"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 shadow-2xl">
            <div className="text-white text-xs leading-relaxed drop-shadow-sm">
              {page.content}
            </div>
          </div>
        </motion.div>
      )}

      {page.media && page.media[0]?.caption && (
        <motion.div
          initial={animate ? { y: -20, opacity: 0 } : {}}
          animate={animate ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="absolute top-20 left-4 z-30"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 shadow-2xl">
            <p className="text-white/90 text-xs italic drop-shadow-sm">
              {page.media[0]?.caption}
            </p>
          </div>
        </motion.div>
      )}
      
      {page.tags.length > 0 && (
        <motion.div
          initial={animate ? { y: -20, opacity: 0 } : {}}
          animate={animate ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="absolute top-20 right-4 z-30"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 shadow-2xl">
            <div className="flex flex-wrap gap-1">
              {page.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs font-medium border border-white/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );

  if (!currentBook) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading book...</p>
        </div>
      </motion.div>
    );
  }

  const currentPage = currentBook.pages[currentPageIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden"
      onClick={handleControlsVisibility}
    >
      {/* Very blurred background image - cropped to fill screen */}
      <div className="fixed inset-0 z-0">
        {currentPage.media && currentPage.media.length > 0 ? (
          <>
            <motion.img
              src={currentPage.media[0].url}
              alt=""
              className="w-full h-full object-cover"
              style={{
                filter: 'blur(12px)',
                transform: 'scale(1.2)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
            <div className="absolute inset-0 bg-black/30" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-50 via-secondary-50 to-neutral-100" />
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/20 to-transparent"
          >
            <div className="flex items-center justify-between p-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/books')}
                className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:bg-white/30 transition-colors border border-white/20"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="text-xs font-medium text-white">Back</span>
              </motion.button>
              
              <div className="text-center text-white">
                <h1 className="text-sm font-bold drop-shadow-lg">{currentBook.title}</h1>
                <p className="text-xs opacity-80">
                  {currentPageIndex + 1}/{currentBook.pages.length}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings({ ...settings, enableSounds: !settings.enableSounds })}
                  className="p-1.5 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:bg-white/30 transition-colors border border-white/20"
                >
                  {settings.enableSounds ? (
                    <Volume2 className="w-3 h-3 text-white" />
                  ) : (
                    <VolumeX className="w-3 h-3 text-white" />
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAutoPlay}
                  className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:bg-white/30 transition-colors border border-white/20"
                >
                  {autoPlay ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white" />}
                  <span className="text-xs font-medium text-white">{autoPlay ? 'Pause' : 'Auto'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {autoPlay && (
        <motion.div
          className="absolute top-16 left-4 right-4 z-30 bg-white/20 backdrop-blur-md rounded-full h-1 overflow-hidden border border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-white"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
      )}

      <div
        {...swipeHandlers}
        className="relative h-screen flex items-center justify-center z-10"
      >
        <motion.div
          className="relative w-full h-full z-20"
        >
          {/* Base Layer - shows the page that should be visible under the turn */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ zIndex: 4 }}
          >
            {direction === 'next' && nextPageIndex !== null
              ? renderPageContent(currentBook.pages[nextPageIndex], false) // Underlay next page (static)
              : renderPageContent(currentPage, direction === null) // Current page animates only when idle
            }
          </div>

          {/* Animation Layer - current page shrinks and moves right to reveal next */}
          {direction === 'next' && (
            <motion.div
              key="next-shrink"
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{
                transformOrigin: 'left center',
                zIndex: 10,
              }}
              initial={{
                scaleX: 1,
                x: 0,
              }}
              animate={{
                scaleX: 0.05,
                x: '-10%',
              }}
              transition={{
                scaleX: { duration: TURN_DURATION_MS / 1000, ease: EASE_SCALE_TURN },
                x: { duration: TURN_DURATION_MS / 1000, ease: EASE_TRANSLATE_TURN },
              }}
            >
              {/* Moving page (current) */}
              <div className="absolute inset-0 w-full h-full">
                {renderPageContent(currentPage, false)}
                {/* Subtle fold shadow for realism */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-black/25 to-transparent" />
              </div>
            </motion.div>
          )}

          {/* Animation Layer - previous page expands from right over current */}
          {direction === 'prev' && previousPageIndex !== null && (
            <motion.div
              key="prev-expand"
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{
                transformOrigin: 'left center',
                zIndex: 10,
              }}
              initial={{
                scaleX: 0.05,
                x: '-10%',
              }}
              animate={{
                scaleX: 1,
                x: 0,
              }}
              transition={{
                scaleX: { duration: TURN_DURATION_MS / 1000, ease: EASE_SCALE_TURN },
                x: { duration: TURN_DURATION_MS / 1000, ease: EASE_TRANSLATE_TURN },
              }}
            >
              {/* Moving page (previous) */}
              <div className="absolute inset-0 w-full h-full">
                {renderPageContent(currentBook.pages[previousPageIndex], false)}
                {/* Subtle fold shadow for realism */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-black/25 to-transparent" />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/20 to-transparent"
          >
            <div className="flex items-center justify-between p-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevPage}
                disabled={isTransitioning}
                className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
              >
                <ChevronLeft className="w-3 h-3 text-white" />
                <span className="text-xs font-medium text-white">Previous</span>
              </motion.button>
              
              <div className="flex items-center gap-1">
                {currentBook.pages.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => !isTransitioning && setCurrentPageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentPageIndex
                        ? 'bg-white border border-white/50'
                        : 'bg-white/30 hover:bg-white/50 border border-white/20'
                    }`}
                  />
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextPage}
                disabled={isTransitioning}
                className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
              >
                <span className="text-xs font-medium text-white">Next</span>
                <ChevronRight className="w-3 h-3 text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookViewPage;
