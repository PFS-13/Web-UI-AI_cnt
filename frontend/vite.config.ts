import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load the environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Split the string of hosts into an array
  const allowedHosts = env.VITE_PREVIEW_ALLOWED_HOSTS
    ? env.VITE_PREVIEW_ALLOWED_HOSTS.split(',')
    : [];

  return {
    plugins: [
      react(),
      // Bundle analyzer
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    ],
    build: {
      // Optimize bundle size
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': ['lucide-react'],
            'state-vendor': ['zustand'],
            'query-vendor': ['@tanstack/react-query'],
            'utils-vendor': ['axios', 'clsx', 'tailwind-merge'],
            // Feature chunks
            'auth': [
              './src/pages/auth/Login',
              './src/pages/auth/Register',
              './src/pages/auth/Verification',
              './src/pages/auth/AuthCallback',
              './src/pages/auth/TellUsAboutYou',
              './src/pages/auth/ResetPassword',
              './src/pages/auth/InputPassword',
              './src/pages/auth/NewPassword'
            ],
            'chat': [
              './src/pages/ChatPage',
              './src/components/chat/MessageList',
              './src/components/chat/ChatLayout',
              './src/components/chat/MarkdownRenderer'
            ],
            'common': [
              './src/components/common/Button',
              './src/components/common/Input',
              './src/components/common/Modal',
              './src/components/common/ErrorBoundary',
              './src/components/common/Toast'
            ]
          }
        }
      },
      // Optimize build
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      // Enable source maps for debugging
      sourcemap: mode === 'development',
    },
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