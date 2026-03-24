/**
 * Analytics feature store — local UI state scoped to the analytics module.
 *
 * Tracks the active date range filter and whether the chart panel is
 * expanded. These are ephemeral UI preferences that don't need to survive
 * a page refresh and have no meaning for other features.
 */
import { create } from 'zustand'

export type DateRange = '7d' | '30d' | '90d' | 'all'

export interface AnalyticsState {
  dateRange:    DateRange
  setDateRange: (range: DateRange) => void

  chartExpanded:    boolean
  toggleChart:      () => void
  setChartExpanded: (expanded: boolean) => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  dateRange:    '30d',
  setDateRange: (range) => set({ dateRange: range }),

  chartExpanded:    false,
  toggleChart:      () => set({ chartExpanded: !get().chartExpanded }),
  setChartExpanded: (expanded) => set({ chartExpanded: expanded }),
}))
