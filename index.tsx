import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Initialize i18next

// Register Service Worker for PWA with proper error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.warn('ServiceWorker registration failed: ', error);
        // Continue without service worker - app should still work
      });
  });
} else {
  console.warn('Service Worker not supported in this browser');
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