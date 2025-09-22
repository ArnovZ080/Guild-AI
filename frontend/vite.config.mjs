import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "framer-motion": path.resolve(__dirname, "./src/shims/noopMotion.jsx"),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    sourcemap: true,
  },
})
