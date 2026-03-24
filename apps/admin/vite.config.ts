import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: { port: 3000 },
  build: {
    target:    'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk — shared heavy deps loaded once
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@mui') ||
              id.includes('node_modules/@emotion')) {
            return 'vendor-mui'
          }
          if (id.includes('node_modules/react-admin') ||
              id.includes('node_modules/ra-')) {
            return 'vendor-ra'
          }
          // Feature chunks — each loads lazily when its route activates
          if (id.includes('features/campaigns')) return 'chunk-campaigns'
          if (id.includes('features/analytics')) return 'chunk-analytics'
          if (id.includes('features/settings'))  return 'chunk-settings'
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['msw'],
  },
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles:  ['@myorg/mocks/vitest-setup'],
  },
})
