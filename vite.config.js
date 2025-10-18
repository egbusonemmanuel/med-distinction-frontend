// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ensures paths are relative for static deployment
  build: {
    rollupOptions: {
      // If you still get "cannot resolve" errors, you can add packages here to avoid externalization
      external: [], 
    },
    chunkSizeWarningLimit: 2000, // optional, to suppress large chunk warnings
  },
});
