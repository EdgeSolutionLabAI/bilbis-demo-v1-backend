import { describe, expect, it } from 'vitest'
import { BASE_URL } from './setup.js'

describe('GET /api/roll-dice', () => {
  it('returns 200 with two integer dice values between 1 and 6', async () => {
    const res = await fetch(`${BASE_URL}/api/roll-dice`)

    expect(res.status).toBe(200)

    const body = (await res.json()) as { dice1: number; dice2: number }

    expect(Number.isInteger(body.dice1)).toBe(true)
    expect(body.dice1).toBeGreaterThanOrEqual(1)
    expect(body.dice1).toBeLessThanOrEqual(6)

    expect(Number.isInteger(body.dice2)).toBe(true)
    expect(body.dice2).toBeGreaterThanOrEqual(1)
    expect(body.dice2).toBeLessThanOrEqual(6)
  })
})
