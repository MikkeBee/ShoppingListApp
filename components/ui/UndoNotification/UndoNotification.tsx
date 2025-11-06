'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import styles from './UndoNotification.module.scss';

export interface UndoNotificationProps {
  isVisible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  timeout?: number; // in milliseconds
  className?: string;
}

export function UndoNotification({
  isVisible,
  message,
  onUndo,
  onDismiss,
  timeout = 5000,
  className,
}: UndoNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(timeout / 1000);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let interval: NodeJS.Timeout;

    // Reset timer when becoming visible
    const startTimer = () => {
      setTimeLeft(timeout / 1000);

      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onDismiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // Use setTimeout to avoid synchronous setState in effect
    const resetTimeout = setTimeout(startTimer, 0);

    return () => {
      clearTimeout(resetTimeout);
      if (interval) clearInterval(interval);
    };
  }, [isVisible, timeout, onDismiss]);

  const handleUndo = () => {
    onUndo();
    onDismiss();
  };

  if (!isVisible) return null;

  const notificationClasses = [
    styles.undoNotification,
    isVisible && styles.visible,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={notificationClasses}>
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        <div className={styles.countdown}>
          <div
            className={styles.countdownBar}
            style={{
              width: `${(timeLeft / (timeout / 1000)) * 100}%`,
              animationDuration: `${timeout}ms`,
            }}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant='secondary'
          onClick={handleUndo}
          className={styles.undoButton}
          size='sm'
        >
          Undo
        </Button>
        <button
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label='Dismiss notification'
          type='button'
        >
          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M11.854 4.146a.5.5 0 010 .708l-7 7a.5.5 0 01-.708-.708l7-7a.5.5 0 01.708 0z'
              clipRule='evenodd'
            />
            <path
              fillRule='evenodd'
              d='M4.146 4.146a.5.5 0 000 .708l7 7a.5.5 0 00.708-.708l-7-7a.5.5 0 00-.708 0z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
