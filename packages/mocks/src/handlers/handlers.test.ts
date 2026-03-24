/**
 * MSW handler tests — one suite per domain.
 *
 * These tests live in packages/mocks because they exercise the mock
 * handlers themselves, not any React component. Each app's previous
 * *App.test.tsx was testing the same handlers; they are consolidated here.
 */
import { describe, test, expect } from 'vitest'
import { server } from '../server'
import { http, HttpResponse } from 'msw'

// ── Users ─────────────────────────────────────────────────────────────────
describe('user handlers', () => {
  test('returns all users', async () => {
    const res = await fetch('http://localhost/api/users')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect(data[0]).toMatchObject({ name: 'Alice Admin' })
  })

  test('returns single user by id', async () => {
    const res = await fetch('http://localhost/api/users/1')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ id: '1', email: 'alice@example.com' })
  })

  test('returns 404 for unknown user', async () => {
    const res = await fetch('http://localhost/api/users/999')
    expect(res.status).toBe(404)
  })
})

// ── Campaigns ─────────────────────────────────────────────────────────────
describe('campaign handlers', () => {
  test('returns campaigns for a websiteId', async () => {
    const res = await fetch('http://localhost/campaigns/v1.0/site-1')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data[0]).toMatchObject({ name: 'Spring Sale', status: 'active' })
  })

  test('filters campaigns by websiteId', async () => {
    const res = await fetch('http://localhost/campaigns/v1.0/site-2')
    const data = await res.json()
    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({ name: 'Winter Promo', status: 'archived' })
  })

  test('POST creates a new campaign', async () => {
    const res = await fetch('http://localhost/campaigns/v1.0/site-1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Black Friday' }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toMatchObject({ name: 'Black Friday', status: 'active' })
  })

  test('DELETE returns 204', async () => {
    const res = await fetch('http://localhost/campaigns/v1.0/site-1/c1', {
      method: 'DELETE',
    })
    expect(res.status).toBe(204)
  })

  test('per-test handler override works', async () => {
    server.use(
      http.get('http://localhost/campaigns/v1.0/:websiteId', () =>
        HttpResponse.json({ error: 'Unavailable' }, { status: 503 })
      )
    )
    const res = await fetch('http://localhost/campaigns/v1.0/site-1')
    expect(res.status).toBe(503)
    // vitest.setup.ts calls server.resetHandlers() after each test
  })
})

// ── Analytics ─────────────────────────────────────────────────────────────
describe('analytics handlers', () => {
  test('returns analytics summary for a websiteId', async () => {
    const res = await fetch('http://localhost/analytics/v1.0/site-1')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ visits: 12400, conversions: 340 })
  })
})

// ── Settings ─────────────────────────────────────────────────────────────
describe('settings handlers', () => {
  test('GET returns settings for a websiteId', async () => {
    const res = await fetch('http://localhost/settings/v1.0/site-1')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ timezone: 'UTC', currency: 'GBP' })
  })

  test('PUT echoes updated settings', async () => {
    const patch = { timezone: 'America/New_York', currency: 'USD', locale: 'en-US' }
    const res = await fetch('http://localhost/settings/v1.0/site-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject(patch)
  })
})
