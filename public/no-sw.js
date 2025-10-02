// Empty service worker file for environments where storage partitioning is blocked
// This prevents the browser from showing storage partitioning errors

console.log('No-op service worker loaded - storage partitioning may be disabled');

// Just register minimal event listeners to prevent errors
self.addEventListener('install', () => {
  console.log('No-op service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('No-op service worker activated');
  self.clients.claim();
});