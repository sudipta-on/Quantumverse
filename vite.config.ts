import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // REQUIRED for GitHub Pages deployment (match your exact repository name)
  base: "/Quantumverse/",

  plugins: [react(), tailwindcss()],
  // Allow Vite dev-server to serve files from src/ (needed for notebook images)
  server: {
    fs: {
      allow: ['..'],
    },
  },
  // Treat PNG/JPG/SVG inside src/ as importable assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-ipynb-renderer'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})