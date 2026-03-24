import { http, HttpResponse } from 'msw'
import type { AnalyticsSummary } from '@myorg/types'

export const analyticsHandlers = [
  http.get('http://localhost/analytics/v1.0/:websiteId', ({ params }) => {
    const summary: AnalyticsSummary = {
      websiteId:   params.websiteId as string,
      visits:      12400,
      conversions: 340,
    }
    return HttpResponse.json(summary)
  }),
]
