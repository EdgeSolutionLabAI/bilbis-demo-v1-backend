import { describe, expect, it } from 'vitest'
import { assertCorsAllowOrigin, BASE_URL, withOrigin } from './setup.js'

// Acceptance criteria: all FE → BE requests succeed from the production origin
// (Access-Control-Allow-Origin present, no CORS error in the browser).
// Covers every publicly-callable endpoint so regressions are caught immediately.

const CORS_ENDPOINTS = [
  { label: '/health', path: '/health' },
  { label: '/api/v1/meta/version', path: '/api/v1/meta/version' },
  { label: '/api/v1/image/random', path: '/api/v1/image/random' },
] as const

describe('CORS simple GET — FE origin receives Access-Control-Allow-Origin', () => {
  for (const { label, path } of CORS_ENDPOINTS) {
    it(`${label} carries CORS header for the FE origin`, async () => {
      const res = await fetch(`${BASE_URL}${path}`, { headers: withOrigin() })
      expect(res.status).toBe(200)
      assertCorsAllowOrigin(res)
    })
  }
})

describe('CORS preflight — OPTIONS returns allow headers for FE origin', () => {
  for (const { label, path } of CORS_ENDPOINTS) {
    it(`OPTIONS ${label} returns 200 or 204 with CORS headers`, async () => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'OPTIONS',
        headers: withOrigin({
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        }),
      })
      expect([200, 204]).toContain(res.status)
      assertCorsAllowOrigin(res)
    })
  }
})
