import React, { Suspense, lazy, createContext, useContext, useEffect } from 'react'
import { Admin, Resource, useGetIdentity } from 'react-admin'
import { LoadingPane } from '@myorg/ui'
import type { AuthContextValue } from '@myorg/types'
import { dataProvider } from './dataProvider'
import { authProvider } from './authProvider'
import { UserList } from './pages/UserList'
import { useGlobalStore } from './stores/globalStore'

// ── Auth context ──────────────────────────────────────────────────────────
// Thin React context wrapping the Zustand global store for components that
// prefer the context API. When an MFE is extracted to its own repo it reads
// this context via a shared @myorg/auth-context package.
export const AuthCtx = createContext<AuthContextValue | null>(null)
export const useAuth = () => {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthCtx.Provider')
  return ctx
}

// ── Zustand global store hydration ───────────────────────────────────────
// Runs once inside <Admin> so ra-keycloak identity is already resolved.
function AuthStoreSync() {
  const { data: identity } = useGetIdentity()
  const setAuth  = useGlobalStore((s) => s.setAuth)
  const clearAuth = useGlobalStore((s) => s.clearAuth)

  useEffect(() => {
    if (identity?.id) {
      // With ra-keycloak: pass keycloak.realmAccess?.roles ?? [] as roles
      setAuth(String(identity.id), [])
    } else {
      clearAuth()
    }
  }, [identity, setAuth, clearAuth])

  return null
}

// ── Feature modules loaded as lazy chunks ─────────────────────────────────
// Each becomes a separate JS chunk via vite.config.ts manualChunks.
// MFE migration: replace each import with a Module Federation remote import.
const CampaignsFeature = lazy(() => import('./features/campaigns/CampaignsFeature'))
const AnalyticsFeature = lazy(() => import('./features/analytics/AnalyticsFeature'))
const SettingsFeature  = lazy(() => import('./features/settings/SettingsFeature'))

export default function App() {
  const userId  = useGlobalStore((s) => s.userId)
  const hasRole = useGlobalStore((s) => s.hasRole)

  const authCtxValue: AuthContextValue = {
    token:   undefined, // populate from keycloak.token when using ra-keycloak
    userId,
    hasRole,
  }

  return (
    <AuthCtx.Provider value={authCtxValue}>
      <Admin dataProvider={dataProvider} authProvider={authProvider}>
        <AuthStoreSync />
        <Resource name="users" list={UserList} />
        <Suspense fallback={<LoadingPane />}>
          <CampaignsFeature />
        </Suspense>
        <Suspense fallback={<LoadingPane />}>
          <AnalyticsFeature />
        </Suspense>
        <Suspense fallback={<LoadingPane />}>
          <SettingsFeature />
        </Suspense>
      </Admin>
    </AuthCtx.Provider>
  )
}
