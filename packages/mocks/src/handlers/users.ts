import { http, HttpResponse } from 'msw'
import type { User } from '@myorg/types'

const users: User[] = [
  { id: '1', name: 'Alice Admin', email: 'alice@example.com' },
  { id: '2', name: 'Bob Builder', email: 'bob@example.com'   },
]

export const userHandlers = [
  http.get('http://localhost/api/users', () =>
    HttpResponse.json(users)
  ),
  http.get('http://localhost/api/users/:id', ({ params }) => {
    const user = users.find(u => u.id === params.id)
    if (!user) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json(user)
  }),
]
