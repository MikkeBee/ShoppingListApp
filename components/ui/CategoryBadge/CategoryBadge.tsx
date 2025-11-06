import React from 'react';
import { ItemCategory } from '@/types/shopping';
import { getCategoryConfig } from '@/utils/categories';
import styles from './CategoryBadge.module.scss';

export interface CategoryBadgeProps {
  /** The category to display */
  category: ItemCategory;
  /** Size variant of the badge */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to show the label text */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for interactive badges */
  onClick?: () => void;
}

export function CategoryBadge({
  category,
  size = 'medium',
  showIcon = true,
  showLabel = true,
  className = '',
  onClick,
}: CategoryBadgeProps) {
  const config = getCategoryConfig(category);
  const isInteractive = !!onClick;

  const badgeClasses = [
    styles.badge,
    styles[size],
    isInteractive && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const badgeStyle = {
    '--category-color': config.color,
    '--category-bg': config.backgroundColor,
  } as React.CSSProperties;

  const content = (
    <>
      {showIcon && (
        <span className={styles.icon} aria-hidden='true'>
          {config.icon}
        </span>
      )}
      {showLabel && <span className={styles.label}>{config.name}</span>}
    </>
  );

  if (isInteractive) {
    return (
      <button
        className={badgeClasses}
        style={badgeStyle}
        onClick={onClick}
        type='button'
        title={config.description}
        aria-label={`${config.name} category`}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={badgeClasses}
      style={badgeStyle}
      title={config.description}
      aria-label={`${config.name} category`}
    >
      {content}
    </span>
  );
}
