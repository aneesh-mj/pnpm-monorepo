import React, { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { http, HttpResponse } from 'msw'
import { userHandlers } from '@myorg/mocks/handlers'
import type { User } from '@myorg/types'

// ── Inline demo component ──────────────────────────────────────────────────
// Not part of the published @myorg/ui library — exists only to demonstrate
// MSW intercepting fetch() calls in Storybook.

function UserList() {
  const [users, setUsers]   = useState<User[]>([])
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost/api/users')
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        return res.json() as Promise<User[]>
      })
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading…</p>
  if (error)   return <p style={{ color: 'red' }}>Error: {error}</p>

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>
          <strong>{u.name}</strong> — {u.email}
        </li>
      ))}
    </ul>
  )
}

// ── Story config ───────────────────────────────────────────────────────────
const meta: Meta<typeof UserList> = {
  title: 'MSW Demo / UserList',
  component: UserList,
}

export default meta
type Story = StoryObj<typeof UserList>

// Happy path — uses the shared handlers from @myorg/mocks
export const WithMockData: Story = {
  parameters: {
    msw: { handlers: userHandlers },
  },
}

// Error state — overrides the GET handler to return a 500
export const ServerError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost/api/users', () =>
          HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        ),
      ],
    },
  },
}
