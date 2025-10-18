import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Minimal config for Vercel
export default defineConfig({
  plugins: [react()],
  base: './'  // ⚠ Important for production on Vercel
})
