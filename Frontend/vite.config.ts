import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
   resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: [
      'localhost',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false, 
      },
    },
    
  },
})
