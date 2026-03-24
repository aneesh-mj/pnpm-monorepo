import React from 'react'
import { Resource } from 'react-admin'
import { CampaignsList } from './components/CampaignsList'

/**
 * Campaigns feature — collocated component inside apps/admin.
 *
 * MFE migration path: move this directory to its own repo, add
 * @module-federation/vite, and change the lazy import in App.tsx to
 * import('mfeCampaigns/CampaignsFeature'). No other changes needed.
 */
export default function CampaignsFeature() {
  return <Resource name="campaigns" list={CampaignsList} />
}
