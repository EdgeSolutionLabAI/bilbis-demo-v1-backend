import { describe, expect, it } from 'vitest'
import { BASE_URL } from './setup.js'

const ENDPOINT = `${BASE_URL}/api/feedback`

async function post(body: unknown) {
  return fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/feedback', () => {
  it('returns 201 with id and createdAt for a valid message', async () => {
    const res = await post({ message: 'Great product!' })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(typeof body.id).toBe('string')
    expect(body.id.length).toBeGreaterThan(0)
    expect(typeof body.createdAt).toBe('string')
    expect(body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('accepts an optional email field without error', async () => {
    const res = await post({ message: 'Nice work', email: 'user@example.com' })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(typeof body.id).toBe('string')
  })

  it('returns 400 for an empty message', async () => {
    const res = await post({ message: '' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(typeof body.error).toBe('string')
    expect(body.error.length).toBeGreaterThan(0)
  })

  it('returns 400 when message field is missing', async () => {
    const res = await post({ email: 'x@example.com' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(typeof body.error).toBe('string')
  })

  it('returns 400 for a message over 1000 characters', async () => {
    const res = await post({ message: 'a'.repeat(1001) })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(typeof body.error).toBe('string')
  })

  it('accepts a message of exactly 1000 characters', async () => {
    const res = await post({ message: 'b'.repeat(1000) })
    expect(res.status).toBe(201)
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    expect(res.status).toBe(400)
  })
})
