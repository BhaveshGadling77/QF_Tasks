import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  // Add this if you want to keep files in src/assets
  assetsInclude: ['**/*.csv'],
})