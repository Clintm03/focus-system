import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // User site (clintm03.github.io repo): assets at domain root — keep base '/'.
  // For a project site only, set VITE_BASE_PATH=/repo-name/ when running npm run build.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
