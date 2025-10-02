const CACHE_NAME = 'mitche-cache-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/awardlogo.png',
];

// Install the service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event to clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // For navigation requests, use a network-first approach.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other requests, use cache-first.
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network, then cache it
        return fetch(request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                if(request.method === 'GET') {
                  cache.put(request, responseToCache);
                }
              });

            return response;
          }
        );
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
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
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
            }
        };
        self.registration.showNotification('Mitché Test Notification', testOptions);
    }
});