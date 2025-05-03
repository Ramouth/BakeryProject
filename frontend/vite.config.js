import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to the Flask backend on port 5000
      '/bakeries': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/protected': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      // Add the /auth routes to match your UserContext code
      '/auth': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})