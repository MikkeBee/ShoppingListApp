'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  prefersReducedMotion,
  ANIMATION_DURATION,
  createStaggerDelay,
} from '@/utils/animations';

export interface UseAnimationOptions {
  /** Animation trigger */
  trigger?: boolean;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Animation duration key */
  duration?: keyof typeof ANIMATION_DURATION;
  /** Whether to animate on mount */
  animateOnMount?: boolean;
  /** Stagger delay for list items */
  staggerDelay?: number;
  /** Index for stagger animations */
  staggerIndex?: number;
}

export interface AnimationState {
  /** Whether the animation should be active */
  isVisible: boolean;
  /** Whether the element has been mounted */
  hasEntered: boolean;
  /** Whether the animation is currently running */
  isAnimating: boolean;
  /** Calculated delay including stagger */
  calculatedDelay: number;
}

/**
 * Hook for managing component animations with reduced motion support
 */
export function useAnimation({
  trigger = true,
  delay = 0,
  duration = 'normal',
  animateOnMount = true,
  staggerDelay = 50,
  staggerIndex = 0,
}: UseAnimationOptions = {}): AnimationState {
  const [isVisible, setIsVisible] = useState(!animateOnMount);
  const [hasEntered, setHasEntered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate stagger delay
  const calculatedDelay =
    delay + createStaggerDelay(staggerIndex, staggerDelay);

  // Handle animation trigger
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (trigger && !prefersReducedMotion()) {
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(true);
        setIsVisible(true);
        setHasEntered(true);

        // Mark animation as complete after duration
        animationRef.current = setTimeout(() => {
          setIsAnimating(false);
        }, ANIMATION_DURATION[duration]);
      }, calculatedDelay);
    } else if (trigger) {
      // Immediate show if reduced motion is preferred
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setHasEntered(true);
        setIsAnimating(false);
      }, 0);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 0);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [trigger, calculatedDelay, duration]);

  // Initial mount animation
  useEffect(() => {
    if (animateOnMount && !hasEntered) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasEntered(true);
      }, calculatedDelay);

      return () => clearTimeout(timer);
    }
  }, [animateOnMount, hasEntered, calculatedDelay]);

  return {
    isVisible,
    hasEntered,
    isAnimating,
    calculatedDelay,
  };
}

/**
 * Hook for managing list item stagger animations
 */
export function useStaggerAnimation(
  itemCount: number,
  baseDelay: number = 50,
  trigger: boolean = true
) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!trigger || prefersReducedMotion()) {
      // Show all items immediately if reduced motion or not triggered
      setVisibleItems(new Set(Array.from({ length: itemCount }, (_, i) => i)));
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];
    setVisibleItems(new Set()); // Reset visible items

    // Stagger the appearance of items
    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, i]));
      }, i * baseDelay);
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [itemCount, baseDelay, trigger]);

  return { visibleItems };
}

/**
 * Hook for managing success/error feedback animations
 */
export function useFeedbackAnimation() {
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    isVisible: boolean;
  }>({
    type: null,
    message: '',
    isVisible: false,
  });

  const showSuccess = useCallback((message: string) => {
    setFeedback({ type: 'success', message, isVisible: true });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setFeedback({ type: 'error', message, isVisible: true });

    // Auto-hide after 4 seconds (longer for errors)
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, isVisible: false }));
    }, 4000);
  }, []);

  const hideFeedback = useCallback(() => {
    setFeedback(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    feedback,
    showSuccess,
    showError,
    hideFeedback,
  };
}

/**
 * Hook for managing loading state animations
 */
export function useLoadingAnimation(
  isLoading: boolean,
  minLoadingTime: number = 300
) {
  const [showLoading, setShowLoading] = useState(false);
  const [hasShownLoading, setHasShownLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        setShowLoading(true);
        setHasShownLoading(true);
      }, 0);
    } else if (hasShownLoading) {
      // Ensure minimum loading time for better UX
      timeoutRef.current = setTimeout(() => {
        setShowLoading(false);
      }, minLoadingTime);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, hasShownLoading, minLoadingTime]);

  return { showLoading };
}
