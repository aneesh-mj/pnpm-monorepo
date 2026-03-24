/**
 * Settings feature store — local UI state scoped to the settings module.
 *
 * Holds an unsaved-changes buffer so the UI can show a "You have unsaved
 * changes" banner and let the user discard before navigating away.
 */
import { create } from 'zustand'

export interface SettingsPatch {
  timezone?: string
  currency?: string
  locale?:   string
}

export interface SettingsState {
  pendingChanges:  SettingsPatch | null
  hasUnsaved:      boolean
  setPending:      (patch: SettingsPatch) => void
  mergePending:    (patch: SettingsPatch) => void
  discardPending:  () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  pendingChanges: null,
  hasUnsaved:     false,

  setPending: (patch) => set({ pendingChanges: patch, hasUnsaved: true }),
  mergePending: (patch) =>
    set({
      pendingChanges: { ...get().pendingChanges, ...patch },
      hasUnsaved: true,
    }),
  discardPending: () => set({ pendingChanges: null, hasUnsaved: false }),
}))
