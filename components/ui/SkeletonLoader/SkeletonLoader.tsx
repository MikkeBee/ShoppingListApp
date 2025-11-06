'use client';

import React from 'react';
import { useAnimation } from '@/hooks/useAnimation';
import styles from './SkeletonLoader.module.scss';

export interface SkeletonLoaderProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Shape of the skeleton */
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  /** Number of lines for text variant */
  lines?: number;
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';
  /** Custom class name */
  className?: string;
  /** Whether to animate the skeleton */
  animate?: boolean;
}

export function SkeletonLoader({
  width = '100%',
  height = '1rem',
  variant = 'text',
  lines = 1,
  speed = 'normal',
  className = '',
  animate = true,
}: SkeletonLoaderProps) {
  const { isVisible } = useAnimation({
    animateOnMount: true,
    trigger: true,
  });

  const skeletonClasses = [
    styles.skeleton,
    styles[variant],
    styles[speed],
    animate && styles.animated,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const skeletonStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    animationDelay: isVisible ? '0ms' : '200ms',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={styles.textContainer}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={skeletonClasses}
            style={{
              ...skeletonStyle,
              width: index === lines - 1 ? '70%' : '100%', // Last line shorter
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={skeletonClasses}
      style={skeletonStyle}
      aria-label='Loading content...'
      role='status'
    />
  );
}

// Preset skeleton components for common use cases

export function ItemSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`${styles.itemSkeleton} ${className}`}>
      <SkeletonLoader variant='circular' width={40} height={40} />
      <div className={styles.itemContent}>
        <SkeletonLoader width='60%' height='1.2rem' />
        <SkeletonLoader width='40%' height='0.9rem' />
      </div>
      <SkeletonLoader variant='rectangular' width={24} height={24} />
    </div>
  );
}

export function ListSkeleton({
  items = 3,
  className = '',
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={`${styles.listSkeleton} ${className}`}>
      {Array.from({ length: items }, (_, index) => (
        <ItemSkeleton key={index} />
      ))}
    </div>
  );
}

export function HeaderSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`${styles.headerSkeleton} ${className}`}>
      <SkeletonLoader width='150px' height='2rem' />
      <SkeletonLoader variant='rectangular' width={80} height='2.5rem' />
    </div>
  );
}
