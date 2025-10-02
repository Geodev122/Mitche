import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Initialize i18next

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext && location.hostname !== 'localhost') {
        console.warn('Service Worker requires HTTPS or localhost');
        return;
      }

      let serviceWorkerPath = '/service-worker.js';

      // Test storage access before registering service worker
      try {
        await navigator.storage.estimate();
      } catch (storageError) {
        console.warn('Storage access blocked, using no-op service worker');
        serviceWorkerPath = '/no-sw.js';
      }

      // Register the service worker
      const registration = await navigator.serviceWorker.register(serviceWorkerPath, {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed, refreshing...');
              window.location.reload();
            }
          });
        }
      });
      
    } catch (error) {
      console.log('ServiceWorker registration failed: ', error);
      // App should still work without service worker
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);