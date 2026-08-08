import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Project Pages URL: https://foxitup1776.github.io/SyncMFG/
export default defineConfig({
  base: '/SyncMFG/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'SYNCMFG',
        short_name: 'SYNCMFG',
        description: 'Lean Six Sigma analysis workbench',
        theme_color: '#1a3a3a',
        background_color: '#e8eef0',
        display: 'standalone',
        start_url: '/SyncMFG/',
        scope: '/SyncMFG/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
