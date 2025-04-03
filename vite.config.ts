import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Ensures 'global' is defined in the browser
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      global: 'globalthis/polyfill', // Alternative polyfill for 'global'
    },
  },
});
