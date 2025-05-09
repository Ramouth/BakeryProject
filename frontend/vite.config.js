import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  // Determine if we're in production build mode
  const isProduction = command === 'build';
  
  // Shared configuration used in both development and production
  const sharedConfig = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  };

  // Development-specific configuration
  if (!isProduction) {
    return {
      ...sharedConfig,
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
      build: {
        sourcemap: true, // Enable sourcemaps for development builds
      },
    };
  }
  
  // Production-specific configuration
  return {
    ...sharedConfig,
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // Split vendor code (React, etc.) into separate chunks
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
          // Add hashing to file names for better caching
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
      sourcemap: false, // Disable sourcemaps in production
      minify: 'terser', // Use terser for better minification
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true, // Remove debugger statements
        },
      },
      // Adjust if your app is not at the root of the domain
      // base: '/app/',
      
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      
      // Generate a manifest file for the backend to use
      manifest: true,
    },
  };
});
