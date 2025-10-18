import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for React on Vercel
export default defineConfig({
  plugins: [react()],
  base: './',       // ⚠ Ensures relative paths for assets
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
