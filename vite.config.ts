import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repository Pages: VITE_BASE_PATH=/repository-name/
// Custom domain or local: VITE_BASE_PATH=/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
