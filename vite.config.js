import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Ignore generated/locked archives so the file watcher cannot crash
    // with EBUSY when an external tool holds them open on Windows.
    watch: {
      ignored: ['**/*.zip', '**/dist/**'],
    },
  },
})
