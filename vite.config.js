import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jspdf']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-lib': ['jspdf']
        }
      }
    }
  }
})