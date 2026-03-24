import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry:    resolve(__dirname, 'src/index.ts'),
      formats:  ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
    },
  },
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles: ['@myorg/mocks/vitest-setup'],
  },
})
