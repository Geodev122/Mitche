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

// Function to handle fetching and validating translation files
const fetchAndValidateTranslation = (event) => {
  return fetch(event.request)
    .then(networkResponse => {
      if (!networkResponse.ok) {
        throw new Error(`Network response was not ok for ${event.request.url}`);
      }
      
      const responseClone = networkResponse.clone();
      
      return responseClone.json()
        .then(data => {
          // JSON is valid. Cache it and return the original response.
          console.log(`Successfully fetched and validated ${event.request.url}`);
          const cacheResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, cacheResponse);
          });
          return networkResponse;
        })
        .catch(error => {
          // JSON is malformed.
          console.error(`Malformed JSON received for ${event.request.url}:`, error);
          // Return a safe, empty JSON object to prevent the app from crashing.
          return new Response('{}', { 
            status: 200, 
            statusText: 'OK', 
            headers: { 'Content-Type': 'application/json' } 
          });
        });
    })
    .catch(error => {
      // Network failed. Try to serve from cache.
      console.warn(`Network request for ${event.request.url} failed. Trying cache. Error:`, error);
      return caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not in cache, also return the safe fallback.
        console.error(`Could not fetch ${event.request.url} from network or cache.`);
        return new Response('{}', { 
          status: 200, 
          statusText: 'OK', 
          headers: { 'Content-Type': 'application/json' } 
        });
      });
    });
};

// Intercept fetch requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Special handling for translation files
  if (url.pathname.includes('/locales') && url.pathname.endsWith('.json')) {
    event.respondWith(fetchAndValidateTranslation(event));
    return;
  }
  
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