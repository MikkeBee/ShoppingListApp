/* eslint-disable no-console */
// Shopping List PWA Service Worker
// Provides offline functionality, caching, and background sync
// Console statements are kept for debugging PWA functionality

const CACHE_NAME = 'shopping-list-v1';
const STATIC_CACHE = 'shopping-list-static-v1';
const DATA_CACHE = 'shopping-list-data-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/manifest.json',
  // Add other static assets that should be cached
];

// API endpoints that should be cached (currently unused but kept for future use)
// const CACHEABLE_APIS = [
//   '/api/lists',
//   '/api/items',
//   // Add other API endpoints
// ];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');

  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[ServiceWorker] Caching static files');
      return cache.addAll(STATIC_FILES);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DATA_CACHE &&
            cacheName !== CACHE_NAME
          ) {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - handle network requests with cache-first strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files with cache-first strategy
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests - network first, fallback to cache
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    console.log('[ServiceWorker] Network request failed, trying cache');

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response if nothing in cache
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Unable to fetch data while offline',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle static files - cache first, fallback to network
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to network
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Request failed:', error);

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('Offline', { status: 503 });
    }

    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === 'sync-shopping-data') {
    event.waitUntil(syncShoppingData());
  }
});

// Sync shopping data when back online
async function syncShoppingData() {
  try {
    console.log('[ServiceWorker] Syncing shopping data');

    // Get pending operations from IndexedDB or localStorage
    const pendingOperations = await getPendingOperations();

    for (const operation of pendingOperations) {
      try {
        await performOperation(operation);
        await removePendingOperation(operation.id);
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync operation:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
  }
}

// Helper functions for offline sync (simplified implementation)
async function getPendingOperations() {
  // In a real implementation, this would read from IndexedDB
  // For now, return empty array
  return [];
}

async function performOperation(operation) {
  // In a real implementation, this would perform the actual API call
  // Based on operation.type ('add', 'update', 'delete') and operation.data
  console.log('[ServiceWorker] Performing operation:', operation);
}

async function removePendingOperation(operationId) {
  // In a real implementation, this would remove the operation from IndexedDB
  console.log('[ServiceWorker] Removing pending operation:', operationId);
}

// Push notification support
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received:', event);

  const options = {
    body: event.data ? event.data.text() : 'New shopping reminder',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
    },
    actions: [
      {
        action: 'view',
        title: 'View List',
        icon: '/icons/view-action.png',
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/close-action.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('Shopping List', options));
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app
    event.waitUntil(clients.openWindow('/'));
  }
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('[ServiceWorker] Notification closed:', event);
});
