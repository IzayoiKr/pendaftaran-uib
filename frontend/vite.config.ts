import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  server: {
    host: true,
    port: 8989,
    watch: {
      usePolling: true,
    },
    hmr: {
      clientPort: 8989,
    },
    proxy: {
      '/api': 'http://localhost:9999',
      '/uni-api': {
        target: 'http://universities.hipolabs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uni-api/, ''),
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', { target: '19' }]
        ]
      }
    }),
    visualizer({
      template: 'raw-data',
      filename: 'visualizer.json',
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-core'
          }
          if (
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'react-router'
          }
          if (
            id.includes('node_modules/sonner/') ||
            id.includes('node_modules/embla-carousel/') ||
            id.includes('node_modules/@marsidev/react-turnstile/')
          ) {
            return 'ui-components'
          }
          if (
            id.includes('node_modules/zod/') ||
            id.includes('node_modules/axios/') ||
            id.includes('node_modules/cookie/') ||
            id.includes('node_modules/set-cookie-parser/')
          ) {
            return 'data-layer'
          }
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['node_modules']
      }
    }
  }
})