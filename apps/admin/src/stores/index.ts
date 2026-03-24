// Global shared store
export { useGlobalStore } from './globalStore'
export type { GlobalState } from './globalStore'

// Feature-local stores
export { useCampaignsStore } from './campaigns/campaignsStore'
export type { CampaignsState } from './campaigns/campaignsStore'

export { useAnalyticsStore } from './analytics/analyticsStore'
export type { AnalyticsState, DateRange } from './analytics/analyticsStore'

export { useSettingsStore } from './settings/settingsStore'
export type { SettingsState, SettingsPatch } from './settings/settingsStore'
