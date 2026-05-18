import { describe, expect, it } from 'vitest'
import { BASE_URL } from './setup.js'

describe('GET /api/ping', () => {
  it('returns 200 with ok === true and a non-empty timestamp', async () => {
    const res = await fetch(`${BASE_URL}/api/ping`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(typeof body.timestamp).toBe('string')
    expect(body.timestamp.length).toBeGreaterThan(0)
  })
})
