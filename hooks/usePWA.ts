import { useEffect, useState } from 'react';

// Type definitions for PWA events
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWAInstallPrompt {
  isSupported: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  install: () => Promise<boolean>;
  dismiss: () => void;
}

export interface PWACapabilities {
  isStandalone: boolean;
  supportsServiceWorker: boolean;
  supportsNotifications: boolean;
  supportsPush: boolean;
  supportsBackgroundSync: boolean;
  isOnline: boolean;
}

// Hook for managing PWA installation
export function usePWAInstall(): PWAInstallPrompt {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode) with timeout to avoid sync setState
    const timer = setTimeout(() => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;
      setIsInstalled(isStandalone);
    }, 0);

    // Listen for beforeinstallprompt event
    const handleInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!installPrompt) return false;

    try {
      const result = await installPrompt.prompt();
      const outcome = result.outcome;

      if (outcome === 'accepted') {
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const dismiss = () => {
    setInstallPrompt(null);
  };

  return {
    isSupported:
      typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    isInstalled,
    canInstall: !!installPrompt,
    install,
    dismiss,
  };
}

// Hook for PWA capabilities detection
export function usePWACapabilities(): PWACapabilities {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isStandalone:
      typeof window !== 'undefined'
        ? window.matchMedia('(display-mode: standalone)').matches
        : false,
    supportsServiceWorker:
      typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    supportsNotifications:
      typeof window !== 'undefined' && 'Notification' in window,
    supportsPush: typeof window !== 'undefined' && 'PushManager' in window,
    supportsBackgroundSync:
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      typeof window !== 'undefined' &&
      window.ServiceWorkerRegistration &&
      'sync' in window.ServiceWorkerRegistration.prototype,
    isOnline,
  };
}

// Service Worker registration and management
export class PWAManager {
  private static instance: PWAManager;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New service worker is available
              this.notifyUpdate();
            }
          });
        }
      });

      return this.registration;
    } catch {
      return null;
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (
      Notification.permission !== 'granted' &&
      Notification.permission !== 'denied'
    ) {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration || !('PushManager' in window)) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as BufferSource,
      });

      return subscription;
    } catch {
      return null;
    }
  }

  async scheduleBackgroundSync(tag: string): Promise<void> {
    if (
      !this.registration ||
      !('sync' in window.ServiceWorkerRegistration.prototype)
    ) {
      return;
    }

    try {
      // Use service worker messaging for background sync
      if (this.registration.active) {
        this.registration.active.postMessage({
          type: 'BACKGROUND_SYNC',
          tag,
        });
      }
    } catch {
      // Background sync failed, handle gracefully
    }
  }

  private notifyUpdate() {
    // Dispatch custom event for app update notification
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Hook for managing offline storage
export function useOfflineStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // Handle JSON parse errors gracefully
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  const updateValue = (newValue: T | ((prev: T) => T)) => {
    const updatedValue =
      typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(value)
        : newValue;

    setValue(updatedValue);

    // Store in localStorage
    try {
      localStorage.setItem(key, JSON.stringify(updatedValue));
    } catch {
      // Handle storage errors gracefully
    }
  };

  return [value, updateValue, isLoaded] as const;
}
