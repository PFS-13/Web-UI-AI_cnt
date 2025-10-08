import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load the environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Split the string of hosts into an array
  const allowedHosts = env.VITE_PREVIEW_ALLOWED_HOSTS
    ? env.VITE_PREVIEW_ALLOWED_HOSTS.split(',')
    : [];

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true,
      // Use the parsed array from .env
      allowedHosts: allowedHosts
    }
  }
});