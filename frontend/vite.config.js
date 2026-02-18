import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: '/quikstarter/',
    define: {
      'import.meta.env.BASE_URL_KICKS_API': JSON.stringify(
        process.env.BASE_URL_KICKS_API || env.BASE_URL_KICKS_API
      )
    },
    plugins: [react()],
    server: {
      allowedHosts: true,
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
    },
  }
})