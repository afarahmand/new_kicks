import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: '/new_kicks_frontend/',
    define: {
      'import.meta.env.BASE_URL_KICKS_API': JSON.stringify(
        process.env.BASE_URL_KICKS_API || env.BASE_URL_KICKS_API
      )
    },
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['all'],  // Vite 5+ requires this when proxied
    },
  }
})