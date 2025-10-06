const CACHE_NAME = 'mitche-cache-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/awardlogo.png',
  '/manifest.json'
];

// Install the service worker and cache assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event to clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Intercept fetch requests with better error handling
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // For navigation requests, use a network-first approach
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached index.html for navigation
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For other requests, use cache-first with network fallback
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        // Return a basic offline response for failed requests
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});

// --- PUSH NOTIFICATION LOGIC ---

// Listen for push events from a push service
self.addEventListener('push', event => {
  let data = { title: 'New Notification', body: 'Something happened!', url: '/' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Push event data is not valid JSON', e);
    }
  }

  const options = {
    body: data.body,
    icon: '/awardlogo.png',
    badge: '/awardlogo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listen for notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is already open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Listener for client-side messages (for testing/simulation)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'show-test-notification') {
    const testOptions = {
      body: 'This shows that push notifications are working correctly!',
      icon: '/awardlogo.png',
      badge: '/awardlogo.png',
      data: {
        url: '/constellation'
      },
      requireInteraction: false
    };
    self.registration.showNotification('Mitché Test Notification', testOptions);
  }
});

// Allow clients to trigger skipWaiting from page context (used after registration)
self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle service worker errors
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});