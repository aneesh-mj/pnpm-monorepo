/**
 * Global shared store — state that every feature needs.
 *
 * Auth fields are populated by App.tsx once ra-keycloak resolves identity.
 * selectedWebsiteId is the cross-feature "scope" selector; all feature
 * stores key their data off this value.
 */
import { create } from 'zustand'

export interface GlobalState {
  // Auth mirror (populated from ra-keycloak / authProvider)
  userId:   string | undefined
  roles:    string[]
  hasRole:  (role: string) => boolean
  setAuth:  (userId: string, roles: string[]) => void
  clearAuth: () => void

  // Cross-feature website scope
  selectedWebsiteId: string | null
  setSelectedWebsite: (id: string) => void
}

export const useGlobalStore = create<GlobalState>((set, get) => ({
  // auth
  userId:   undefined,
  roles:    [],
  hasRole:  (role) => get().roles.includes(role),
  setAuth:  (userId, roles) => set({ userId, roles }),
  clearAuth: () => set({ userId: undefined, roles: [] }),

  // website scope
  selectedWebsiteId: null,
  setSelectedWebsite: (id) => set({ selectedWebsiteId: id }),
}))
