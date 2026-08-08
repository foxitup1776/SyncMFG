import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project Pages URL: https://foxitup1776.github.io/SyncMFG/
export default defineConfig({
  base: '/SyncMFG/',
  plugins: [react()],
})
