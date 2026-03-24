import { http, HttpResponse } from 'msw'
import type { Campaign } from '@myorg/types'

const campaigns: Campaign[] = [
  { id: 'c1', name: 'Spring Sale',  websiteId: 'site-1', status: 'active',   createdAt: '2025-01-01' },
  { id: 'c2', name: 'Summer Push',  websiteId: 'site-1', status: 'paused',   createdAt: '2025-03-01' },
  { id: 'c3', name: 'Winter Promo', websiteId: 'site-2', status: 'archived', createdAt: '2024-11-01' },
]

export const campaignHandlers = [
  http.get('http://localhost/campaigns/v1.0/:websiteId', ({ params }) =>
    HttpResponse.json(campaigns.filter(c => c.websiteId === params.websiteId))
  ),
  http.post('http://localhost/campaigns/v1.0/:websiteId', async ({ request, params }) => {
    const body = await request.json() as Partial<Campaign>
    const created: Campaign = {
      id:        `c-${Date.now()}`,
      name:      body.name ?? 'Untitled',
      websiteId: params.websiteId as string,
      status:    'active',
      createdAt: new Date().toISOString(),
    }
    return HttpResponse.json(created, { status: 201 })
  }),
  http.delete('http://localhost/campaigns/v1.0/:websiteId/:id', () =>
    new HttpResponse(null, { status: 204 })
  ),
]
