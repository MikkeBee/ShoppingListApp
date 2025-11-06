// Animation Utilities for Shopping List App
// Provides consistent animation values and utilities

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

// Easing Functions
export const ANIMATION_EASING = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Animation Presets
export const ANIMATIONS = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: ANIMATION_DURATION.normal,
    easing: ANIMATION_EASING.smooth,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: ANIMATION_DURATION.fast,
    easing: ANIMATION_EASING.smooth,
  },
  slideInUp: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: ANIMATION_DURATION.normal,
    easing: ANIMATION_EASING.spring,
  },
  slideInDown: {
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: ANIMATION_DURATION.normal,
    easing: ANIMATION_EASING.spring,
  },
  slideOutUp: {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(-20px)' },
    duration: ANIMATION_DURATION.fast,
    easing: ANIMATION_EASING.smooth,
  },
  slideOutDown: {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(20px)' },
    duration: ANIMATION_DURATION.fast,
    easing: ANIMATION_EASING.smooth,
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: ANIMATION_DURATION.normal,
    easing: ANIMATION_EASING.bounce,
  },
  scaleOut: {
    from: { opacity: 1, transform: 'scale(1)' },
    to: { opacity: 0, transform: 'scale(0.9)' },
    duration: ANIMATION_DURATION.fast,
    easing: ANIMATION_EASING.smooth,
  },
  bounce: {
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.05)' },
    duration: ANIMATION_DURATION.fast,
    easing: ANIMATION_EASING.bounce,
  },
} as const;

// Reduced Motion Check
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Animation Hook Utilities
export const getAnimationDuration = (
  duration: keyof typeof ANIMATION_DURATION
): number => {
  return prefersReducedMotion() ? 0 : ANIMATION_DURATION[duration];
};

export const getAnimationEasing = (
  easing: keyof typeof ANIMATION_EASING
): string => {
  return prefersReducedMotion() ? 'none' : ANIMATION_EASING[easing];
};

// Spring Animation Generator
export const createSpringAnimation = (
  stiffness: number = 100,
  damping: number = 10,
  mass: number = 1
): string => {
  if (prefersReducedMotion()) return 'none';

  // Convert spring physics to cubic-bezier approximation
  const w = Math.sqrt(stiffness / mass);
  const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));

  if (dampingRatio < 1) {
    const wd = w * Math.sqrt(1 - dampingRatio * dampingRatio);
    const x1 = (dampingRatio * w - wd) / w;
    const x2 = (dampingRatio * w + wd) / w;
    return `cubic-bezier(${Math.max(0, Math.min(1, x1))}, 0, ${Math.max(0, Math.min(1, x2))}, 1)`;
  }

  return ANIMATION_EASING.smooth;
};

// Stagger Animation Utilities
export const createStaggerDelay = (
  index: number,
  baseDelay: number = 50
): number => {
  return prefersReducedMotion() ? 0 : index * baseDelay;
};

export type AnimationName = keyof typeof ANIMATIONS;
export type AnimationDuration = keyof typeof ANIMATION_DURATION;
export type AnimationEasing = keyof typeof ANIMATION_EASING;
