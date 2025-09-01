/**
 * useSwipeGestures Hook - Mobile touch interactions with react-swipeable
 */

import { useSwipeable, SwipeableHandlers, SwipeEventData } from 'react-swipeable';
import { useState, useCallback } from 'react';

export interface SwipeGestureOptions {
  onSwipeLeft?: (data: SwipeEventData) => void;
  onSwipeRight?: (data: SwipeEventData) => void;
  onSwipeUp?: (data: SwipeEventData) => void;
  onSwipeDown?: (data: SwipeEventData) => void;
  onSwiping?: (data: SwipeEventData) => void;
  onSwipeStart?: (data: SwipeEventData) => void;
  onSwipeEnd?: () => void;
  threshold?: number;
  preventScrollOnSwipe?: boolean;
  trackMouse?: boolean;
  trackTouch?: boolean;
  delta?: number;
  rotationAngle?: number;
  enabled?: boolean;
}

export interface SwipeState {
  isSwiping: boolean;
  direction: 'Left' | 'Right' | 'Up' | 'Down' | null;
  velocity: number;
  distance: number;
  deltaX: number;
  deltaY: number;
}

export interface UseSwipeGesturesReturn {
  handlers: SwipeableHandlers;
  swipeState: SwipeState;
  resetSwipe: () => void;
}

export function useSwipeGestures(options: SwipeGestureOptions = {}): UseSwipeGesturesReturn {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwiping,
    onSwipeStart,
    onSwipeEnd,
    threshold: _threshold = 50, // Handled by react-swipeable internally
    preventScrollOnSwipe = false,
    trackMouse = false,
    trackTouch = true,
    delta = 10,
    rotationAngle = 0,
    enabled = true,
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    velocity: 0,
    distance: 0,
    deltaX: 0,
    deltaY: 0,
  });

  const resetSwipe = useCallback(() => {
    setSwipeState({
      isSwiping: false,
      direction: null,
      velocity: 0,
      distance: 0,
      deltaX: 0,
      deltaY: 0,
    });
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      if (!enabled) return;
      
      setSwipeState(prev => ({
        ...prev,
        isSwiping: false,
        direction: 'Left',
        velocity: eventData.velocity,
        distance: Math.abs(eventData.deltaX),
        deltaX: eventData.deltaX,
        deltaY: eventData.deltaY,
      }));
      
      onSwipeLeft?.(eventData);
      setTimeout(resetSwipe, 100);
    },
    
    onSwipedRight: (eventData) => {
      if (!enabled) return;
      
      setSwipeState(prev => ({
        ...prev,
        isSwiping: false,
        direction: 'Right',
        velocity: eventData.velocity,
        distance: Math.abs(eventData.deltaX),
        deltaX: eventData.deltaX,
        deltaY: eventData.deltaY,
      }));
      
      onSwipeRight?.(eventData);
      setTimeout(resetSwipe, 100);
    },
    
    onSwipedUp: (eventData) => {
      if (!enabled) return;
      
      setSwipeState(prev => ({
        ...prev,
        isSwiping: false,
        direction: 'Up',
        velocity: eventData.velocity,
        distance: Math.abs(eventData.deltaY),
        deltaX: eventData.deltaX,
        deltaY: eventData.deltaY,
      }));
      
      onSwipeUp?.(eventData);
      setTimeout(resetSwipe, 100);
    },
    
    onSwipedDown: (eventData) => {
      if (!enabled) return;
      
      setSwipeState(prev => ({
        ...prev,
        isSwiping: false,
        direction: 'Down',
        velocity: eventData.velocity,
        distance: Math.abs(eventData.deltaY),
        deltaX: eventData.deltaX,
        deltaY: eventData.deltaY,
      }));
      
      onSwipeDown?.(eventData);
      setTimeout(resetSwipe, 100);
    },
    
    onSwiping: (eventData) => {
      if (!enabled) return;
      
      setSwipeState(prev => ({
        ...prev,
        isSwiping: true,
        velocity: eventData.velocity,
        deltaX: eventData.deltaX,
        deltaY: eventData.deltaY,
        distance: Math.sqrt(eventData.deltaX ** 2 + eventData.deltaY ** 2),
      }));
      
      onSwiping?.(eventData);
    },
    
    onSwipeStart: (eventData) => {
      if (!enabled) return;
      
      setSwipeState(prev => ({
        ...prev,
        isSwiping: true,
        direction: null,
        velocity: 0,
        distance: 0,
        deltaX: 0,
        deltaY: 0,
      }));
      
      onSwipeStart?.(eventData);
    },
    
    onTouchEndOrOnMouseUp: () => {
      if (!enabled) return;
      
      setSwipeState(prev => ({ ...prev, isSwiping: false }));
      onSwipeEnd?.();
    },
    
    preventScrollOnSwipe,
    trackMouse,
    trackTouch,
    delta,
    rotationAngle,
  });

  return {
    handlers: enabled ? handlers : ({} as SwipeableHandlers),
    swipeState,
    resetSwipe,
  };
}

export interface UseSwipeNavigationOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeNavigation(options: UseSwipeNavigationOptions = {}) {
  const {
    onNext,
    onPrevious,
    onUp,
    onDown,
    threshold: _threshold = 50, // Handled by react-swipeable
    enabled = true,
  } = options;

  return useSwipeGestures({
    onSwipeLeft: () => onNext?.(),
    onSwipeRight: () => onPrevious?.(),
    onSwipeUp: () => onUp?.(),
    onSwipeDown: () => onDown?.(),
    // threshold, // Handled by react-swipeable internally
    enabled,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });
}

export interface UsePinchGestureOptions {
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  enabled?: boolean;
}

export function usePinchGesture(options: UsePinchGestureOptions = {}) {
  const { onPinch, onPinchStart, onPinchEnd, enabled = true } = options;
  const [isPinching, setIsPinching] = useState(false);
  const [initialDistance, setInitialDistance] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);

  const getDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getCenter = useCallback((touches: TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled || event.touches.length !== 2) return;
    
    const distance = getDistance(event.touches);
    setInitialDistance(distance);
    setIsPinching(true);
    setCurrentScale(1);
    onPinchStart?.();
  }, [enabled, getDistance, onPinchStart]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled || !isPinching || event.touches.length !== 2) return;
    
    const currentDistance = getDistance(event.touches);
    const scale = currentDistance / initialDistance;
    const center = getCenter(event.touches);
    
    setCurrentScale(scale);
    onPinch?.(scale, center);
    
    event.preventDefault();
  }, [enabled, isPinching, initialDistance, getDistance, getCenter, onPinch]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!enabled || event.touches.length > 0) return;
    
    setIsPinching(false);
    setInitialDistance(0);
    onPinchEnd?.();
  }, [enabled, onPinchEnd]);

  return {
    isPinching,
    currentScale,
    touchHandlers: enabled ? {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    } : {},
  };
}