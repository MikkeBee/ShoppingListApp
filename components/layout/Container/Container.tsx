import React, { ReactNode } from 'react';
import styles from './Container.module.scss';

export interface ContainerProps {
  /** Content to be contained */
  children: ReactNode;
  /** Container size variant */
  size?: 'small' | 'medium' | 'large' | 'full';
  /** Whether to remove padding */
  noPadding?: boolean;
  /** Whether to center content vertically */
  centerVertical?: boolean;
  /** Custom class name */
  className?: string;
  /** HTML element type */
  as?: 'div' | 'main' | 'section' | 'article';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'medium',
  noPadding = false,
  centerVertical = false,
  className = '',
  as: Component = 'div',
}) => {
  const containerClasses = [
    styles.container,
    styles[size],
    noPadding && styles.noPadding,
    centerVertical && styles.centerVertical,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Component className={containerClasses}>{children}</Component>;
};

Container.displayName = 'Container';
