// Root-level vitest setup — referenced by vitest.config.ts workspace runner
// Individual app configs use @myorg/mocks/vitest-setup directly
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './packages/mocks/src/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
