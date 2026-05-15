import { describe, expect, it } from 'vitest'
import { BASE_URL } from './setup.js'

describe('GET /api/time', () => {
  it('returns 200 with iso string and finite positive epochMs', async () => {
    const res = await fetch(`${BASE_URL}/api/time`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(typeof body.iso).toBe('string')
    expect(body.iso.length).toBeGreaterThan(0)
    expect(Number.isFinite(body.epochMs)).toBe(true)
    expect(body.epochMs).toBeGreaterThan(0)
  })
})
