import { describe, expect, it } from 'vitest'
import { BASE_URL } from './setup.js'

describe('GET /health', () => {
  it('returns 200 with {status:"ok"}', async () => {
    const res = await fetch(`${BASE_URL}/health`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ status: 'ok' })
  })

  it('responds to HEAD without a body', async () => {
    const res = await fetch(`${BASE_URL}/health`, { method: 'HEAD' })
    expect(res.status).toBe(200)
  })
})
