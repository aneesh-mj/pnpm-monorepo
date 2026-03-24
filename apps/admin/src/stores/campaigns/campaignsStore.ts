/**
 * Campaigns feature store — local UI state scoped to the campaigns module.
 *
 * Keeps draft form state and an optimistic-delete set so the UI stays
 * responsive while the DELETE request is in-flight. Nothing here is
 * visible to analytics or settings — they have their own slices.
 */
import { create } from 'zustand'
import type { Campaign } from '@myorg/types'

export interface CampaignsState {
  /** Campaign being created or edited before submission */
  draftCampaign: Partial<Campaign> | null
  setDraft:      (draft: Partial<Campaign>) => void
  updateDraft:   (patch: Partial<Campaign>) => void
  clearDraft:    () => void

  /** IDs optimistically removed while DELETE is in-flight */
  deletingIds: Set<string>
  markDeleting:   (id: string) => void
  unmarkDeleting: (id: string) => void
}

export const useCampaignsStore = create<CampaignsState>((set, get) => ({
  draftCampaign: null,
  setDraft:      (draft) => set({ draftCampaign: draft }),
  updateDraft:   (patch) =>
    set({ draftCampaign: { ...get().draftCampaign, ...patch } }),
  clearDraft:    () => set({ draftCampaign: null }),

  deletingIds:    new Set(),
  markDeleting:   (id) =>
    set({ deletingIds: new Set([...get().deletingIds, id]) }),
  unmarkDeleting: (id) => {
    const next = new Set(get().deletingIds)
    next.delete(id)
    set({ deletingIds: next })
  },
}))
