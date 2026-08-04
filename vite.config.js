import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      // For `netlify dev` local development with real functions
      '/.netlify/functions': 'http://localhost:8888',
      '/api': 'http://localhost:8888',
    },
  },
})
