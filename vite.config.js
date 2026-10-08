import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves unknown paths with 404.html; reuse the SPA shell so deep links load.
const spaFallback = {
  name: 'spa-404-fallback',
  closeBundle() {
    copyFileSync(resolve('dist/index.html'), resolve('dist/404.html'))
    try {
      copyFileSync(resolve('inventory-dashboard.html'), resolve('dist/inventory-dashboard.html'))
    } catch {}
  },
}

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/autoparts-tawfikya/' : '/',
  plugins: [react(), spaFallback],
  server: {
    port: 3000,
    open: true,
  },
}))
