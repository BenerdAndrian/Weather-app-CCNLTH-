import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Requests to /api are forwarded to the Express backend, so the browser
// talks to one origin in development (no CORS issues, no hard-coded host).
const apiProxy = {
  '/api': {
    target: process.env.API_PROXY_TARGET || 'http://localhost:3001',
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
    setupFiles: ['src/test/setup.js'],
  },
})
