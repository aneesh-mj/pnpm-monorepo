/**
 * Zustand store unit tests.
 *
 * Zustand stores are plain functions — no React, no Provider needed.
 * We call getState() / setState() directly for fast, isolated tests.
 */
import { describe, test, expect, beforeEach } from 'vitest'
import { useGlobalStore }   from '../globalStore'
import { useCampaignsStore } from '../campaigns/campaignsStore'
import { useAnalyticsStore } from '../analytics/analyticsStore'
import { useSettingsStore }  from '../settings/settingsStore'

// ── helpers ───────────────────────────────────────────────────────────────
// Reset each store to its initial state before every test so tests are
// fully isolated from each other regardless of execution order.
function resetAll() {
  useGlobalStore.setState({
    userId: undefined,
    roles:  [],
    selectedWebsiteId: null,
  })
  useCampaignsStore.setState({
    draftCampaign: null,
    deletingIds:   new Set(),
  })
  useAnalyticsStore.setState({
    dateRange:    '30d',
    chartExpanded: false,
  })
  useSettingsStore.setState({
    pendingChanges: null,
    hasUnsaved:     false,
  })
}

// ── Global store ──────────────────────────────────────────────────────────
describe('globalStore', () => {
  beforeEach(resetAll)

  test('initial state is unauthenticated with no website selected', () => {
    const s = useGlobalStore.getState()
    expect(s.userId).toBeUndefined()
    expect(s.roles).toEqual([])
    expect(s.selectedWebsiteId).toBeNull()
  })

  test('setAuth populates userId and roles', () => {
    useGlobalStore.getState().setAuth('user-42', ['admin', 'editor'])
    const s = useGlobalStore.getState()
    expect(s.userId).toBe('user-42')
    expect(s.roles).toEqual(['admin', 'editor'])
  })

  test('hasRole returns true for an assigned role', () => {
    useGlobalStore.getState().setAuth('user-42', ['editor'])
    expect(useGlobalStore.getState().hasRole('editor')).toBe(true)
  })

  test('hasRole returns false for an unassigned role', () => {
    useGlobalStore.getState().setAuth('user-42', ['editor'])
    expect(useGlobalStore.getState().hasRole('superadmin')).toBe(false)
  })

  test('clearAuth resets userId and roles', () => {
    useGlobalStore.getState().setAuth('user-42', ['admin'])
    useGlobalStore.getState().clearAuth()
    const s = useGlobalStore.getState()
    expect(s.userId).toBeUndefined()
    expect(s.roles).toEqual([])
  })

  test('setSelectedWebsite updates selectedWebsiteId', () => {
    useGlobalStore.getState().setSelectedWebsite('site-99')
    expect(useGlobalStore.getState().selectedWebsiteId).toBe('site-99')
  })
})

// ── Campaigns store ───────────────────────────────────────────────────────
describe('campaignsStore', () => {
  beforeEach(resetAll)

  test('initial state has no draft and empty deletingIds', () => {
    const s = useCampaignsStore.getState()
    expect(s.draftCampaign).toBeNull()
    expect(s.deletingIds.size).toBe(0)
  })

  test('setDraft sets the draft campaign', () => {
    useCampaignsStore.getState().setDraft({ name: 'Summer Push' })
    expect(useCampaignsStore.getState().draftCampaign).toMatchObject({ name: 'Summer Push' })
  })

  test('updateDraft merges into the existing draft', () => {
    useCampaignsStore.getState().setDraft({ name: 'Summer Push' })
    useCampaignsStore.getState().updateDraft({ status: 'paused' })
    const draft = useCampaignsStore.getState().draftCampaign
    expect(draft).toMatchObject({ name: 'Summer Push', status: 'paused' })
  })

  test('clearDraft nullifies draft', () => {
    useCampaignsStore.getState().setDraft({ name: 'Test' })
    useCampaignsStore.getState().clearDraft()
    expect(useCampaignsStore.getState().draftCampaign).toBeNull()
  })

  test('markDeleting adds id to the set', () => {
    useCampaignsStore.getState().markDeleting('c1')
    expect(useCampaignsStore.getState().deletingIds.has('c1')).toBe(true)
  })

  test('unmarkDeleting removes id from the set', () => {
    useCampaignsStore.getState().markDeleting('c1')
    useCampaignsStore.getState().unmarkDeleting('c1')
    expect(useCampaignsStore.getState().deletingIds.has('c1')).toBe(false)
  })

  test('unmarkDeleting does not affect other ids in the set', () => {
    useCampaignsStore.getState().markDeleting('c1')
    useCampaignsStore.getState().markDeleting('c2')
    useCampaignsStore.getState().unmarkDeleting('c1')
    expect(useCampaignsStore.getState().deletingIds.has('c2')).toBe(true)
  })
})

// ── Analytics store ───────────────────────────────────────────────────────
describe('analyticsStore', () => {
  beforeEach(resetAll)

  test('initial dateRange is 30d and chart is collapsed', () => {
    const s = useAnalyticsStore.getState()
    expect(s.dateRange).toBe('30d')
    expect(s.chartExpanded).toBe(false)
  })

  test('setDateRange updates dateRange', () => {
    useAnalyticsStore.getState().setDateRange('90d')
    expect(useAnalyticsStore.getState().dateRange).toBe('90d')
  })

  test('toggleChart flips chartExpanded', () => {
    useAnalyticsStore.getState().toggleChart()
    expect(useAnalyticsStore.getState().chartExpanded).toBe(true)
    useAnalyticsStore.getState().toggleChart()
    expect(useAnalyticsStore.getState().chartExpanded).toBe(false)
  })

  test('setChartExpanded sets chartExpanded directly', () => {
    useAnalyticsStore.getState().setChartExpanded(true)
    expect(useAnalyticsStore.getState().chartExpanded).toBe(true)
  })
})

// ── Settings store ────────────────────────────────────────────────────────
describe('settingsStore', () => {
  beforeEach(resetAll)

  test('initial state has no pending changes', () => {
    const s = useSettingsStore.getState()
    expect(s.pendingChanges).toBeNull()
    expect(s.hasUnsaved).toBe(false)
  })

  test('setPending sets a full pending patch and marks hasUnsaved', () => {
    useSettingsStore.getState().setPending({ timezone: 'UTC', currency: 'EUR' })
    const s = useSettingsStore.getState()
    expect(s.pendingChanges).toMatchObject({ timezone: 'UTC', currency: 'EUR' })
    expect(s.hasUnsaved).toBe(true)
  })

  test('mergePending adds fields without overwriting untouched ones', () => {
    useSettingsStore.getState().setPending({ timezone: 'UTC' })
    useSettingsStore.getState().mergePending({ currency: 'USD' })
    const s = useSettingsStore.getState()
    expect(s.pendingChanges).toMatchObject({ timezone: 'UTC', currency: 'USD' })
  })

  test('mergePending overwrites a field that already exists', () => {
    useSettingsStore.getState().setPending({ timezone: 'UTC' })
    useSettingsStore.getState().mergePending({ timezone: 'America/New_York' })
    expect(useSettingsStore.getState().pendingChanges?.timezone).toBe('America/New_York')
  })

  test('discardPending clears changes and resets hasUnsaved', () => {
    useSettingsStore.getState().setPending({ locale: 'en-US' })
    useSettingsStore.getState().discardPending()
    const s = useSettingsStore.getState()
    expect(s.pendingChanges).toBeNull()
    expect(s.hasUnsaved).toBe(false)
  })
})
