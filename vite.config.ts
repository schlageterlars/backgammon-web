import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Backgammon',
        short_name: 'Backgammon',
        description: 'My Progressive Web App',
        theme_color: '#3162d3',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/csrf-token': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/get-lobby-count': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/get-username': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/update-username': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/lobby': 'http://localhost:8080'
    }
  }
})
