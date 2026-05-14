import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { assertCorsAllowOrigin, BASE_URL, withOrigin } from './setup.js'

// ─── Response schemas ───────────────────────────────────────────────────────

const MetaVersionSchema = z.object({
  version: z.string(),
  commit: z.string(),
  buildTime: z.string(),
})

const ImageRandomSchema = z.object({
  url: z.string().url(),
})

// ─── /api/v1/meta/version ───────────────────────────────────────────────────

describe('GET /api/v1/meta/version', () => {
  it('returns 200 with correct shape', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/meta/version`, {
      headers: withOrigin(),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    MetaVersionSchema.parse(body)
  })

  it('carries CORS allow-origin header for the FE origin', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/meta/version`, {
      headers: withOrigin(),
    })
    assertCorsAllowOrigin(res)
  })

  it('responds to CORS preflight with 200', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/meta/version`, {
      method: 'OPTIONS',
      headers: withOrigin({
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      }),
    })
    // Hono CORS middleware returns 204 for OPTIONS; 200 is also acceptable
    expect([200, 204]).toContain(res.status)
    assertCorsAllowOrigin(res)
  })
})

// ─── /api/v1/image/random ───────────────────────────────────────────────────

describe('GET /api/v1/image/random', () => {
  it('returns 200 with correct shape', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/image/random`)
    expect(res.status).toBe(200)
    const body = await res.json()
    ImageRandomSchema.parse(body)
  })

  it('returns a unique URL on every call', async () => {
    const [a, b] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/image/random`).then((r) => r.json()),
      fetch(`${BASE_URL}/api/v1/image/random`).then((r) => r.json()),
    ])
    // Seeds are random, so URLs should differ (collision probability is negligible)
    expect((a as { url: string }).url).not.toBe((b as { url: string }).url)
  })
})

// ─── 4xx error states ───────────────────────────────────────────────────────

describe('4xx error responses', () => {
  it('returns 404 for an unknown route', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/does-not-exist`)
    expect(res.status).toBe(404)
  })

  it('returns 404 for /api/v1/presence with no sub-path (no routes defined)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/presence`, {
      headers: withOrigin(),
    })
    expect(res.status).toBe(404)
  })

  it('returns 404 for /api/v1/meta without a sub-path', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/meta`, {
      headers: withOrigin(),
    })
    expect(res.status).toBe(404)
  })

  it('returns non-2xx for a bad method on a known route', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/meta/version`, {
      method: 'DELETE',
      headers: withOrigin(),
    })
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.status).toBeLessThan(600)
  })
})
