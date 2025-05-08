import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // This adds proper SPA history fallback
    historyApiFallback: true,
    proxy: {
      // Proxy all API calls to the Flask backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // API endpoints
      '/auth': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/bakeries': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/products': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/categories': {
        target: 'http://localhost:5000/',
        changeOrigin: true, 
        secure: false,
      },
      '/bakeryreviews': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/productreviews': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    // Add proper sourcemaps for debugging
    sourcemap: true,
  },
})