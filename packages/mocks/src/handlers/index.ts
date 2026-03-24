import { userHandlers }     from './users'
import { campaignHandlers } from './campaigns'
import { analyticsHandlers } from './analytics'
import { settingsHandlers }  from './settings'

// All handlers — consumed by both browser worker and Node server
export const handlers = [
  ...userHandlers,
  ...campaignHandlers,
  ...analyticsHandlers,
  ...settingsHandlers,
]

// Named domain exports — for per-suite overrides in tests
export { userHandlers, campaignHandlers, analyticsHandlers, settingsHandlers }
