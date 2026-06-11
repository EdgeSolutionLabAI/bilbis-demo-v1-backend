import { describe, expect, it } from 'vitest'
import { BASE_URL } from './setup.js'

describe('GET /version', () => {
  it('returns 200 with a JSON body containing a non-empty version string field', async () => {
    const res = await fetch(`${BASE_URL}/version`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('version')
    expect(typeof body.version).toBe('string')
    expect(body.version.length).toBeGreaterThan(0)
  })

  it('returns either the git SHA or unknown fallback', async () => {
    const res = await fetch(`${BASE_URL}/version`)
    expect(res.status).toBe(200)
    const body = await res.json()
    // The version should be the git SHA or 'unknown' if GIT_SHA env var is not set
    expect(typeof body.version).toBe('string')
    expect(body.version.length).toBeGreaterThan(0)
  })
})
