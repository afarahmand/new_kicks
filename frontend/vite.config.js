import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Define global constants
    define: {
      'import.meta.env.KICKS_API_BASE_URL': JSON.stringify(
        process.env.KICKS_API_BASE_URL || env.KICKS_API_BASE_URL
      )
    },
  }
})
