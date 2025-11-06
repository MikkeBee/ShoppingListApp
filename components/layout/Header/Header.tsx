import React from 'react';
import { Container } from '../Container';
import { PWAInstallButton } from '@/components/ui';
import styles from './Header.module.scss';

export interface HeaderProps {
  /** App title */
  title?: string;
  /** Whether to make header sticky */
  sticky?: boolean;
  /** Custom class name */
  className?: string;
  /** Right side content (e.g., list selector) */
  rightContent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Shopping Lists',
  sticky = true,
  className = '',
  rightContent,
}) => {
  const headerClasses = [styles.header, sticky && styles.sticky, className]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClasses}>
      <Container size='medium' className={styles.headerContainer}>
        <div className={styles.headerContent}>
          {/* Left side - App title */}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{title}</h1>
          </div>

          {/* Right side - List selector and PWA install */}
          <div className={styles.actionsSection}>
            {rightContent ? (
              <div className={styles.rightContent}>
                {rightContent}
                <PWAInstallButton size='sm' variant='secondary' />
              </div>
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.placeholderText}>Select List</span>
                <svg
                  className={styles.placeholderIcon}
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M6 9l2 2 2-2' />
                </svg>
                <PWAInstallButton size='sm' variant='secondary' />
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

Header.displayName = 'Header';
