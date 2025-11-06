'use client';

import React from 'react';
import { usePWAInstall } from '@/hooks/usePWA';
import { Button } from '@/components/ui/Button/Button';
import styles from './PWAInstallButton.module.scss';

export interface PWAInstallButtonProps {
  className?: string;
  variant?: 'add' | 'edit' | 'delete' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

// Simple Download icon component
const DownloadIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
  >
    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
    <polyline points='7,10 12,15 17,10' />
    <line x1='12' y1='15' x2='12' y2='3' />
  </svg>
);

export function PWAInstallButton({
  className,
  variant = 'secondary',
  size = 'md',
}: PWAInstallButtonProps) {
  const { canInstall, install } = usePWAInstall();
  const [isInstalling, setIsInstalling] = React.useState(false);

  if (!canInstall) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await install();
      if (success) {
        // Installation successful or user accepted
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Button
      onClick={handleInstall}
      disabled={isInstalling}
      variant={variant}
      size={size}
      className={`${styles.installButton} ${className || ''}`}
    >
      <DownloadIcon size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} />
      {isInstalling ? 'Installing...' : 'Install App'}
    </Button>
  );
}
