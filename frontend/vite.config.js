import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Define global constants
    define: {
      'import.meta.env.BASE_URL_KICKS_API': JSON.stringify(
        process.env.BASE_URL_KICKS_API || env.BASE_URL_KICKS_API
      )
    },
  }
})
