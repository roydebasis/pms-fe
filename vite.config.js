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
  // Vitest inherits the `@` alias and plugins from this config.
  test: {
    environment: 'happy-dom',
    // Same origin as the mocked API so happy-dom does not issue a CORS
    // preflight that MSW has no handler for.
    environmentOptions: { happyDOM: { url: 'http://localhost:8000/' } },
    setupFiles: ['./tests/setup.js'],
    clearMocks: true,
    restoreMocks: true,
  },
})
