import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Custom domain serves from root (style.hackctl.com/), so assets use absolute paths.
  // Do NOT change to a subpath unless moving off the custom domain.
  base: "/",
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 }
})
