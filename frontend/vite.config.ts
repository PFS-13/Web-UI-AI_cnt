import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Development server configuration
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },
  // Preview server configuration (for production build preview)
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true
  }
})
