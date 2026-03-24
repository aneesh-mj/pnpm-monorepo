import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./packages/mocks/src/vitest.setup.ts'],
    projects: ['apps/admin', 'packages/ui', 'packages/types', 'packages/mocks'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'html'],
      include:  ['apps/*/src/**', 'packages/*/src/**'],
      exclude:  ['**/*.d.ts', '**/mocks/**', '**/index.ts'],
    },
  },
})
