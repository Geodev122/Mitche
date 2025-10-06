import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    headers: {
      'Service-Worker-Allowed': '/',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Create smaller, more granular chunks by grouping node_modules by package name.
        // This prevents a single massive vendor chunk and lets the browser cache common libs separately.
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Separate @firebase scoped packages into their own chunk
            if (id.includes('/@firebase/')) return 'firebase_scoped';

            // If module is part of firebase (non-scoped) packages, put into firebase chunk
            if (id.includes('/firebase/')) return 'firebase_plain';

            // try to extract package name from path
            const parts = id.split('node_modules/').pop()?.split('/');
            if (!parts) return 'vendor';
            // scoped packages start with @scope/pkg
            const pkg = parts[0].startsWith('@') && parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0];
            // keep some important groups together
            const largeVendors = ['lucide-react', 'date-fns', 'i18next', 'react-router-dom'];
            if (largeVendors.includes(pkg)) return pkg.replace('/', '_');
            // default to vendor for small packages to avoid too many tiny chunks
            return 'vendor';
          }
        }
      }
    },
  sourcemap: true,
    cssCodeSplit: true,
    minify: 'esbuild',
    target: 'es2020',
    commonjsOptions: {
      include: [/node_modules/]
    },
    chunkSizeWarningLimit: 600
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
