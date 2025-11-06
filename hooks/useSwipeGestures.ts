import { useState, useCallback, useRef, useMemo } from 'react';

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

export interface SwipeOptions {
  threshold?: number; // Minimum distance for swipe (default: 50px)
  velocity?: number; // Minimum velocity for swipe (default: 0.3px/ms)
  restraint?: number; // Maximum perpendicular distance (default: 100px)
  allowedTime?: number; // Maximum time for swipe (default: 300ms)
}

export interface UseSwipeGesturesReturn {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  isSwipeActive: boolean;
  swipeDirection: SwipeGesture['direction'] | null;
}

const DEFAULT_OPTIONS: Required<SwipeOptions> = {
  threshold: 50,
  velocity: 0.3,
  restraint: 100,
  allowedTime: 300,
};

export function useSwipeGestures(
  onSwipe: (gesture: SwipeGesture) => void,
  options: SwipeOptions = {}
): UseSwipeGesturesReturn {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<
    SwipeGesture['direction'] | null
  >(null);

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const touchMoveRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchMoveRef.current = null;
    setIsSwipeActive(true);
    setSwipeDirection(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    touchMoveRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    // Calculate current swipe direction for visual feedback
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(deltaY > 0 ? 'down' : 'up');
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const endTouch = e.changedTouches[0];
      const endTime = Date.now();

      const startX = touchStartRef.current.x;
      const startY = touchStartRef.current.y;
      const startTime = touchStartRef.current.time;

      const endX = endTouch.clientX;
      const endY = endTouch.clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      // Reset states
      setIsSwipeActive(false);
      setSwipeDirection(null);
      touchStartRef.current = null;
      touchMoveRef.current = null;

      // Check if it's a valid swipe
      if (
        deltaTime <= opts.allowedTime &&
        distance >= opts.threshold &&
        velocity >= opts.velocity
      ) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        let direction: SwipeGesture['direction'];
        let perpDistance: number;

        if (absX >= absY) {
          // Horizontal swipe
          direction = deltaX > 0 ? 'right' : 'left';
          perpDistance = absY;
        } else {
          // Vertical swipe
          direction = deltaY > 0 ? 'down' : 'up';
          perpDistance = absX;
        }

        // Check restraint
        if (perpDistance <= opts.restraint) {
          const gesture: SwipeGesture = {
            direction,
            distance,
            velocity,
            duration: deltaTime,
          };

          onSwipe(gesture);
        }
      }
    },
    [onSwipe, opts]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isSwipeActive,
    swipeDirection,
  };
}
