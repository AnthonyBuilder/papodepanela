import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import adsense from 'vite-plugin-adsense'
import { env } from 'process'
import sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    adsense({
      client: env.VITE_ADSENSE_CLIENT || 'ca-pub-6045768913014450',
    }),
    sitemap({
      hostname: 'https://papodepanela.site',
      dynamicRoutes: [
        '/',
        '/recipes',
        '/saved',
        '/login',
      ],
      changefreq: 'daily',
      priority: 0.7,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
