import { http, HttpResponse } from 'msw'

export const settingsHandlers = [
  http.get('http://localhost/settings/v1.0/:websiteId', ({ params }) =>
    HttpResponse.json({
      websiteId: params.websiteId,
      timezone:  'UTC',
      currency:  'GBP',
      locale:    'en-GB',
    })
  ),
  http.put('http://localhost/settings/v1.0/:websiteId', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(body)
  }),
]
