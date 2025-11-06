import { useState, useCallback, useRef, useEffect } from 'react';

export interface PullToRefreshOptions {
  threshold?: number; // Distance to trigger refresh (default: 80px)
  resistance?: number; // Pull resistance factor (default: 2.5)
  onRefresh?: () => Promise<void> | void;
  disabled?: boolean;
}

export interface UsePullToRefreshReturn {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  pullProgress: number; // 0 to 1, where 1 is threshold reached
}

export function usePullToRefresh(
  options: PullToRefreshOptions = {}
): UsePullToRefreshReturn {
  const {
    threshold = 80,
    resistance = 2.5,
    onRefresh,
    disabled = false,
  } = options;

  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Calculate pull progress (0 to 1)
  const pullProgress = Math.min(pullDistance / threshold, 1);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;

      const touch = e.touches[0];
      startYRef.current = touch.clientY;
      currentYRef.current = touch.clientY;

      // Check if we're at the top of the scrollable area
      const target = e.currentTarget as HTMLElement;
      elementRef.current = target;

      if (target.scrollTop === 0) {
        setIsPulling(true);
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling || !startYRef.current || disabled || isRefreshing) return;

      const touch = e.touches[0];
      currentYRef.current = touch.clientY;

      const deltaY = touch.clientY - startYRef.current;

      // Only allow pulling down
      if (deltaY > 0) {
        // Apply resistance to the pull
        const distance = Math.max(0, deltaY / resistance);
        setPullDistance(distance);

        // Prevent default scrolling when pulling
        e.preventDefault();
      } else {
        // Reset if pulling up
        setPullDistance(0);
        setIsPulling(false);
      }
    },
    [isPulling, disabled, isRefreshing, resistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    const shouldRefresh = pullDistance >= threshold;

    setIsPulling(false);

    if (shouldRefresh && onRefresh) {
      setIsRefreshing(true);

      try {
        await onRefresh();
      } catch {
        // Handle error silently or with user notification
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Animate back to 0
      const startDistance = pullDistance;
      const duration = 200;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentDistance = startDistance * (1 - easeOut);

        setPullDistance(currentDistance);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setPullDistance(0);
        }
      };

      requestAnimationFrame(animate);
    }

    startYRef.current = null;
    currentYRef.current = null;
    elementRef.current = null;
  }, [isPulling, pullDistance, threshold, onRefresh, disabled]);

  // Reset state when disabled changes
  useEffect(() => {
    if (disabled) {
      setIsPulling(false);
      setIsRefreshing(false);
      setPullDistance(0);
      startYRef.current = null;
      currentYRef.current = null;
      elementRef.current = null;
    }
  }, [disabled]);

  // Safety: Ensure pullDistance is 0 when not actively pulling or refreshing
  useEffect(() => {
    if (!isPulling && !isRefreshing && pullDistance !== 0) {
      setPullDistance(0);
    }
  }, [isPulling, isRefreshing, pullDistance]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress,
  };
}
