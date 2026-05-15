import { describe, expect, it } from 'vitest'
import { BASE_URL } from './setup.js'

describe('POST /api/coin-flip', () => {
  it('returns 200 with valid result and flipId', async () => {
    const res = await fetch(`${BASE_URL}/api/coin-flip`, { method: 'POST' })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { result: string; flipId: string }
    expect(['heads', 'tails']).toContain(body.result)
    expect(typeof body.flipId).toBe('string')
    expect(body.flipId.length).toBeGreaterThan(0)
  })
})
