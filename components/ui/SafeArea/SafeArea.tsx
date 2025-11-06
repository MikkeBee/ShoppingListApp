'use client';

import React, { useEffect, useState } from 'react';
import styles from './SafeArea.module.scss';

export interface SafeAreaProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  className?: string;
}

export function SafeArea({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  className,
}: SafeAreaProps) {
  const [safeAreaSupported, setSafeAreaSupported] = useState(false);

  useEffect(() => {
    // Check if safe-area-inset is supported with timeout to avoid sync setState
    const timer = setTimeout(() => {
      const testElement = document.createElement('div');
      testElement.style.paddingTop = 'env(safe-area-inset-top)';
      document.body.appendChild(testElement);

      const computed = getComputedStyle(testElement);
      const hasSafeArea =
        computed.paddingTop !== '0px' && computed.paddingTop !== '';

      document.body.removeChild(testElement);
      setSafeAreaSupported(hasSafeArea);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const safeAreaClasses = [
    styles.safeArea,
    edges.includes('top') && styles.safeTop,
    edges.includes('bottom') && styles.safeBottom,
    edges.includes('left') && styles.safeLeft,
    edges.includes('right') && styles.safeRight,
    safeAreaSupported && styles.supported,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={safeAreaClasses}>{children}</div>;
}

// Hook to get safe area values
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);

      setSafeArea({
        top: parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-top') || '0'
        ),
        bottom: parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'
        ),
        left: parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-left') || '0'
        ),
        right: parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-right') || '0'
        ),
      });
    };

    // Set CSS custom properties for safe area
    const root = document.documentElement;
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    root.style.setProperty(
      '--safe-area-inset-bottom',
      'env(safe-area-inset-bottom)'
    );
    root.style.setProperty(
      '--safe-area-inset-left',
      'env(safe-area-inset-left)'
    );
    root.style.setProperty(
      '--safe-area-inset-right',
      'env(safe-area-inset-right)'
    );

    updateSafeArea();

    // Listen for orientation changes
    window.addEventListener('orientationchange', updateSafeArea);
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return safeArea;
}
