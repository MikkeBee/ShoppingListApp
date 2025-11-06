'use client';

import React from 'react';
import { useAnimation, useFeedbackAnimation } from '@/hooks/useAnimation';
import styles from './AnimatedFeedback.module.scss';

export interface AnimatedFeedbackProps {
  /** Type of feedback */
  type: 'success' | 'error' | 'warning' | 'info';
  /** Feedback message */
  message: string;
  /** Whether the feedback is visible */
  isVisible: boolean;
  /** Callback when feedback is dismissed */
  onDismiss?: () => void;
  /** Auto-dismiss duration in milliseconds */
  autoDismiss?: number;
  /** Position of the feedback */
  position?: 'top' | 'bottom' | 'center';
  /** Custom class name */
  className?: string;
}

// Icon components for different feedback types
const CheckIcon = () => (
  <svg
    className={styles.icon}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
  >
    <path
      className={styles.checkPath}
      d='M20 6L9 17l-5-5'
      strokeDasharray='30'
      strokeDashoffset='30'
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    className={styles.icon}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
  >
    <circle cx='12' cy='12' r='10' />
    <line x1='15' y1='9' x2='9' y2='15' />
    <line x1='9' y1='9' x2='15' y2='15' />
  </svg>
);

const WarningIcon = () => (
  <svg
    className={styles.icon}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
  >
    <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
    <line x1='12' y1='9' x2='12' y2='13' />
    <line x1='12' y1='17' x2='12.01' y2='17' />
  </svg>
);

const InfoIcon = () => (
  <svg
    className={styles.icon}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
  >
    <circle cx='12' cy='12' r='10' />
    <line x1='12' y1='16' x2='12' y2='12' />
    <line x1='12' y1='8' x2='12.01' y2='8' />
  </svg>
);

export function AnimatedFeedback({
  type,
  message,
  isVisible,
  onDismiss,
  autoDismiss = 0,
  position = 'top',
  className = '',
}: AnimatedFeedbackProps) {
  const { isVisible: shouldShow, hasEntered } = useAnimation({
    trigger: isVisible,
    animateOnMount: false,
    delay: 0,
  });

  // Auto-dismiss functionality
  React.useEffect(() => {
    if (isVisible && autoDismiss > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoDismiss, onDismiss]);

  if (!hasEntered && !isVisible) {
    return null;
  }

  const feedbackClasses = [
    styles.feedback,
    styles[type],
    styles[position],
    shouldShow && styles.visible,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return null;
    }
  };

  return (
    <div className={feedbackClasses} role='alert' aria-live='polite'>
      <div className={styles.content}>
        {getIcon()}
        <span className={styles.message}>{message}</span>
        {onDismiss && (
          <button
            className={styles.dismissButton}
            onClick={onDismiss}
            aria-label='Dismiss notification'
          >
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Hook integration component for global feedback
export function GlobalFeedback() {
  const { feedback, hideFeedback } = useFeedbackAnimation();

  return (
    <AnimatedFeedback
      type={feedback.type || 'info'}
      message={feedback.message}
      isVisible={feedback.isVisible}
      onDismiss={hideFeedback}
      autoDismiss={feedback.type === 'success' ? 3000 : 4000}
      position='top'
    />
  );
}
