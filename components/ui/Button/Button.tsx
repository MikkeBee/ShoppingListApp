import React from 'react';

import styles from './Button.module.scss';

export interface ButtonProps {
  variant: 'add' | 'edit' | 'delete' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  'aria-label': ariaLabel,
  className = '',
}) => {
  const buttonClasses = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    fullWidth && styles['full-width'],
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden='true' />
      ) : (
        children
      )}
    </button>
  );
};
