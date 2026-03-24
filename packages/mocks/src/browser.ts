import { setupWorker } from 'msw/browser'
import { handlers } from './handlers/index'

/**
 * MSW browser worker.
 * Initialised in apps/admin/src/main.tsx (dev only).
 * The service worker file (mockServiceWorker.js) must be copied to
 * apps/admin/public/ via: cd apps/admin && npx msw init public/ --save
 */
export const worker = setupWorker(...handlers)
