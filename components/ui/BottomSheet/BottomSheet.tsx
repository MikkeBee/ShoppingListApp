'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import styles from './BottomSheet.module.scss';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: 'auto' | 'half' | 'large' | 'full';
  closeOnBackdrop?: boolean;
  showHandle?: boolean;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
  closeOnBackdrop = true,
  showHandle = true,
  className,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Mount/unmount for portal
  useEffect(() => {
    // Use a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => setMounted(true), 0);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  // Handle open/close animations, body scroll, and focus management
  useEffect(() => {
    // Use a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      if (isOpen) {
        // Store the currently focused element when opening
        previousActiveElementRef.current =
          document.activeElement as HTMLElement;

        setIsAnimating(true);
        // Prevent body scroll when sheet is open
        document.body.style.overflow = 'hidden';

        // Focus the first focusable element in the sheet after a small delay
        setTimeout(() => {
          if (sheetRef.current) {
            const focusableElements = sheetRef.current.querySelectorAll(
              'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
              (focusableElements[0] as HTMLElement).focus();
            }
          }
        }, 100);
      } else {
        setIsAnimating(false);
        // Restore body scroll when sheet is closed
        document.body.style.overflow = '';

        // Restore focus to the previously focused element
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
          previousActiveElementRef.current = null;
        }
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Swipe to close gesture
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGestures(
    gesture => {
      if (gesture.direction === 'down' && gesture.distance > 100) {
        onClose();
      }
    },
    {
      threshold: 50,
      velocity: 0.3,
    }
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const sheetClasses = [
    styles.bottomSheet,
    styles[`height${height.charAt(0).toUpperCase() + height.slice(1)}`],
    isOpen ? styles.open : styles.closed,
    isAnimating ? styles.animating : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!mounted) return null;

  return createPortal(
    <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}>
      <div className={styles.backdrop} onClick={handleBackdropClick} />
      <div
        ref={sheetRef}
        className={sheetClasses}
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {showHandle && (
          <div className={styles.handle}>
            <div className={styles.handleBar} />
          </div>
        )}

        {title && (
          <div className={styles.header}>
            <h2 id='bottom-sheet-title' className={styles.title}>
              {title}
            </h2>
            <button
              type='button'
              className={styles.closeButton}
              onClick={onClose}
              aria-label='Close'
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
              </svg>
            </button>
          </div>
        )}

        <div ref={contentRef} className={styles.content}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
