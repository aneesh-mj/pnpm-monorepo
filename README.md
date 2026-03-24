# MFE Monorepo

React Admin monorepo with Vite code-splitting, shared MSW mocking, Vitest workspace,
GitLab CI, and JFrog Artifactory. Verified working with Node 22, pnpm 9.

## Structure

```
apps/
  admin/          — Host shell (React Admin + Keycloak stub + MUI)
  mfe-campaigns/  — Campaigns feature module (lazy chunk)
  mfe-analytics/  — Analytics feature module (lazy chunk)
  mfe-settings/   — Settings feature module (lazy chunk)
packages/
  mocks/          — Shared MSW handlers, browser worker, Node server + vitest setup
  ui/             — Shared MUI component library (published to JFrog)
  types/          — Shared TypeScript interfaces (published to JFrog)
```

## Quick start

```bash
# 1. Install
pnpm install

# 2. Register MSW service worker (one-time, required for browser mocking in dev)
cd apps/admin && npx msw init public/ --save && cd ../..

# 3. Start dev server
pnpm dev       # hot-reload on http://localhost:3000
```

## Testing

```bash
pnpm test             # all tests across all packages (vitest workspace)
pnpm test:watch       # watch mode
pnpm test:ui          # vitest UI in browser
```

Run a single app in isolation:
```bash
pnpm --filter=mfe-campaigns test
```

## Build

```bash
pnpm --filter=@myorg/types build   # compile shared types
pnpm --filter=@myorg/ui build      # compile shared UI components
pnpm --filter=@myorg/admin build   # build the full app (includes all MFE chunks)
```

Or use the root build script which runs them in order:
```bash
pnpm build
```

Build output in `apps/admin/dist/`:
```
index.html
assets/
  vendor-react-*.js     — react + react-dom (loaded once)
  vendor-mui-*.js       — MUI + emotion (loaded once)
  vendor-ra-*.js        — react-admin + ra-* (loaded once)
  chunk-campaigns-*.js  — campaigns feature (lazy, loaded on demand)
  chunk-analytics-*.js  — analytics feature (lazy, loaded on demand)
  chunk-settings-*.js   — settings feature (lazy, loaded on demand)
  index-*.js            — shell + routing
```

## MSW architecture

All handlers live in `packages/mocks/src/handlers/` — one file per domain.
The same handlers power both the browser dev worker and the Vitest Node server.

```
packages/mocks/src/
  handlers/
    users.ts          GET /api/users, GET /api/users/:id
    campaigns.ts      GET|POST|DELETE /campaigns/v1.0/:websiteId[/:id]
    analytics.ts      GET /analytics/v1.0/:websiteId
    settings.ts       GET|PUT /settings/v1.0/:websiteId
    index.ts          re-exports all handlers + named domain arrays
  server.ts           setupServer() for Vitest (Node)
  browser.ts          setupWorker() for dev (browser)
  vitest.setup.ts     beforeAll/afterEach/afterAll lifecycle — imported by all apps
```

Override a handler for a single test:
```ts
import { server } from '@myorg/mocks/server'
import { http, HttpResponse } from 'msw'

server.use(
  http.get('http://localhost/campaigns/v1.0/:websiteId', () =>
    HttpResponse.json({ error: 'Unavailable' }, { status: 503 })
  )
)
// resetHandlers() called automatically after each test by vitest.setup.ts
```

## MFE migration path

When a team needs independent deployment, steps are:

1. Move `apps/mfe-campaigns/` to its own Git repo
2. Add `@module-federation/vite` to that repo's `vite.config.ts`  
3. Move `packages/mocks/src/handlers/campaigns.ts` into that repo
4. In `apps/admin/vite.config.ts`: replace `'mfe-campaigns'` in `manualChunks`
   with a `federation.remotes` entry
5. In `apps/admin/src/App.tsx`: change the lazy import to `import('mfeCampaigns/CampaignsApp')`

No other code changes needed.

## Replacing the auth stub

`apps/admin/src/authProvider.ts` is a dev stub. Replace with ra-keycloak:

```ts
import Keycloak from 'keycloak-js'
import { keycloakAuthProvider } from 'ra-keycloak'

const keycloak = new Keycloak({
  url:      'https://your-keycloak/auth',
  realm:    'your-realm',
  clientId: 'admin-app',
})
export const authProvider = keycloakAuthProvider(keycloak)
```

## Environment variables

| Variable       | Default | Description                      |
|----------------|---------|----------------------------------|
| `VITE_API_URL` | ` `     | Backend API base URL             |
| `JFROG_TOKEN`  | CI only | JFrog Artifactory npm auth token |

## Key version pins

| Package       | Pinned to | Reason                                         |
|---------------|-----------|------------------------------------------------|
| `vite`        | `6.2.7`   | 6.4.x has a null-id bug with MF plugins        |
| `ra-keycloak` | `^2.0.0`  | Latest published version is 2.0.0 (not 3.x)   |
