// ── Auth ─────────────────────────────────────────────────────────────────
export interface AuthContextValue {
  token:   string | undefined
  hasRole: (role: string) => boolean
  userId:  string | undefined
}

// ── API route constants ───────────────────────────────────────────────────
export const API_ROUTES = {
  campaigns: (websiteId: string) => `/campaigns/v1.0/${websiteId}`,
  analytics: (websiteId: string) => `/analytics/v1.0/${websiteId}`,
  settings:  (websiteId: string) => `/settings/v1.0/${websiteId}`,
  users:     ()                  => `/api/users`,
} as const

// ── Entity types ─────────────────────────────────────────────────────────
export interface Campaign {
  id:        string
  name:      string
  websiteId: string
  status:    'active' | 'paused' | 'archived'
  createdAt: string
}

export interface Website {
  id:   string
  name: string
  url:  string
}

export interface User {
  id:    string
  name:  string
  email: string
}

export interface AnalyticsSummary {
  websiteId:   string
  visits:      number
  conversions: number
}

export * from './GamePlay';