import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

const useHttps = process.env.HTTPS === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    ...(useHttps ? [basicSsl()] : []),
  ],
  server: {
    host: true, // Exposes on local network so mobile devices can access
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
