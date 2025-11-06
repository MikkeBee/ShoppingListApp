'use client';

import React from 'react';
import styles from './FloatingActionButton.module.scss';

export interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export function FloatingActionButton({
  onClick,
  icon,
  label = 'Add Item',
  className,
  disabled = false,
  variant = 'primary',
  size = 'large',
}: FloatingActionButtonProps) {
  const fabClasses = [
    styles.fab,
    styles[`fab${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`fab${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const defaultIcon = (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' />
    </svg>
  );

  return (
    <button
      type='button'
      className={fabClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-fab
    >
      <span className={styles.fabIcon}>{icon || defaultIcon}</span>
      <span className={styles.fabLabel}>{label}</span>
    </button>
  );
}
