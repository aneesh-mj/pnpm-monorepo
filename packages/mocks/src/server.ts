import { setupServer } from 'msw/node'
import { handlers } from './handlers/index'

/**
 * Single MSW server instance for all test suites.
 * Lifecycle is managed in vitest.setup.ts at the repo root.
 *
 * Usage in tests:
 *   import { server } from '@myorg/mocks/server'
 *   server.use(http.get('/path', () => HttpResponse.json({ ... })))
 */
export const server = setupServer(...handlers)
