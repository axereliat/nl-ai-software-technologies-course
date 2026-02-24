import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  envDir: '..',  // Look for .env in project root
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
})