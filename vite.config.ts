import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import adsense from 'vite-plugin-adsense'
import { env } from 'process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), adsense({
      client: env.VITE_ADSENSE_CLIENT || 'ca-pub-6045768913014450',
    }),],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
