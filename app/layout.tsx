import type { Metadata } from 'next';
import { ShoppingProvider } from '@/contexts';
import { PWAProvider } from '@/components/PWAProvider/PWAProvider';

import './globals.scss';

export const metadata: Metadata = {
  title: 'Shopping List - Organize Your Shopping',
  description:
    'A mobile-first shopping list application for organizing and managing your shopping items by category.',
  keywords: [
    'shopping list',
    'grocery list',
    'shopping app',
    'mobile shopping',
    'organize shopping',
  ],
  authors: [{ name: 'Shopping List App' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shopping List',
  },
  icons: {
    apple: '/icon-192x192.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  other: {
    // Disable pull-to-refresh on mobile
    'msapplication-tap-highlight': 'no',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#007AFF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <ShoppingProvider>
          <PWAProvider>{children}</PWAProvider>
        </ShoppingProvider>
      </body>
    </html>
  );
}
