import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          reactflow: ['reactflow'],
          charts: ['recharts'],
          socket: ['socket.io-client'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'reactflow', 'recharts', 'socket.io-client'],
  },
  define: {
    global: 'globalThis',
  },
  ssr: {
    noExternal: ['reactflow', 'recharts', 'socket.io-client'],
  },
})
