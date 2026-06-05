import { describe, expect, it } from 'vitest'
import { assertCorsAllowOrigin, BASE_URL, withOrigin } from './setup.js'

describe('GET /matches/today', () => {
  it('returns 200 with a JSON array of matches', async () => {
    const res = await fetch(`${BASE_URL}/matches/today`, {
      headers: withOrigin(),
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/application\/json/)

    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
  })

  it('each match has the required fields with correct types', async () => {
    const res = await fetch(`${BASE_URL}/matches/today`, {
      headers: withOrigin(),
    })
    const body: unknown[] = await res.json()

    for (const match of body) {
      expect(match).toMatchObject({
        id: expect.any(String),
        team1: expect.any(String),
        team2: expect.any(String),
        time: expect.any(String),
        event: expect.any(String),
        format: expect.any(String),
      })
      // time must be a parseable ISO-8601 datetime
      expect(new Date((match as { time: string }).time).getTime()).not.toBeNaN()
    }
  })

  it('responds with CORS allow-origin header for the production FE origin', async () => {
    const res = await fetch(`${BASE_URL}/matches/today`, {
      headers: withOrigin(),
    })
    assertCorsAllowOrigin(res)
  })

  it('responds to OPTIONS preflight with 204 and CORS headers', async () => {
    const res = await fetch(`${BASE_URL}/matches/today`, {
      method: 'OPTIONS',
      headers: withOrigin({
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'content-type',
      }),
    })
    // Hono cors middleware returns 204 for preflight
    expect([200, 204]).toContain(res.status)
    assertCorsAllowOrigin(res)
  })
})
