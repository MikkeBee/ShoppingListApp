'use client';

import React, { useEffect } from 'react';
import { usePWAInstall, usePWACapabilities } from '@/hooks/usePWA';

export interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const { canInstall } = usePWAInstall();
  const { isOnline, isStandalone } = usePWACapabilities();

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register(
            '/sw.js',
            {
              scope: '/',
            }
          );

          // Service Worker registered successfully

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New version available
                  // New version available - could show notification
                  // Could show notification to user
                }
              });
            }
          });
        } catch {
          // Service Worker registration failed - handle silently
        }
      });
    }
  }, []);

  // Show install prompt when appropriate
  useEffect(() => {
    // Show install prompt after user has used the app for a bit
    if (canInstall && !isStandalone) {
      const timer = setTimeout(() => {
        const shouldPrompt = !localStorage.getItem('pwa-install-dismissed');
        if (shouldPrompt) {
          // Could show install prompt here
          // PWA can be installed - could show install prompt
        }
      }, 30000); // Wait 30 seconds before prompting

      return () => clearTimeout(timer);
    }
  }, [canInstall, isStandalone]);

  // Handle offline/online status
  useEffect(() => {
    const handleOnline = () => {
      // App is online - could show online notification
    };

    const handleOffline = () => {
      // App is offline - could show offline notification
    };

    if (isOnline) {
      handleOnline();
    } else {
      handleOffline();
    }
  }, [isOnline]);

  return <>{children}</>;
}
