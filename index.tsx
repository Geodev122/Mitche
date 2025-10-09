import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Initialize i18next
import './styles/theme.css';
import { info, warn } from './utils/logger';

// Register Service Worker for PWA as early as possible (helps Lighthouse detect control of start_url).
// We avoid waiting for the 'load' event so the SW can install/activate sooner. Keep it fail-safe.
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        // If there's a waiting worker, attempt to skip waiting so it can take control sooner.
        info('ServiceWorker registration successful with scope: ', registration.scope);
        if (registration.waiting) {
          try { registration.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch (e) { /* noop */ }
        }
      })
      .catch(error => {
        // Non-fatal: continue without SW
        warn('ServiceWorker registration failed:', error);
      });
  } catch (e) {
    // Defensive - some environments may throw synchronously
    warn('ServiceWorker registration threw:', e);
  }
} else {
  warn('Service Worker not supported in this browser');
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