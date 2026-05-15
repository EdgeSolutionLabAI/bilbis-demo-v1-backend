import { describe, expect, it } from 'vitest'
import { BASE_URL } from './setup.js'

const SESSION_URL = `${BASE_URL}/api/guess/session`
const GUESS_URL = `${BASE_URL}/api/guess`

async function startSession() {
  const res = await fetch(SESSION_URL, { method: 'POST' })
  expect(res.status).toBe(200)
  return res.json() as Promise<{
    sessionId: string
    minValue: number
    maxValue: number
    attemptLimit: number
  }>
}

describe('POST /api/guess/session', () => {
  it('returns 200 with correct shape and constants', async () => {
    const body = await startSession()
    expect(typeof body.sessionId).toBe('string')
    expect(body.sessionId.length).toBeGreaterThan(0)
    expect(body.minValue).toBe(1)
    expect(body.maxValue).toBe(100)
    expect(body.attemptLimit).toBe(7)
  })

  it('returns a unique sessionId on each call', async () => {
    const a = await startSession()
    const b = await startSession()
    expect(a.sessionId).not.toBe(b.sessionId)
  })
})

describe('POST /api/guess — validation errors', () => {
  it('returns 400 invalid_session for an unknown sessionId', async () => {
    const res = await fetch(GUESS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'no-such-id', guess: 50 }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('invalid_session')
  })

  it('returns 400 out_of_range when guess is below minValue', async () => {
    const { sessionId } = await startSession()
    const res = await fetch(GUESS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, guess: 0 }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('out_of_range')
  })

  it('returns 400 out_of_range when guess is above maxValue', async () => {
    const { sessionId } = await startSession()
    const res = await fetch(GUESS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, guess: 101 }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('out_of_range')
  })

  it('returns 400 not_an_integer for a float guess', async () => {
    const { sessionId } = await startSession()
    const res = await fetch(GUESS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, guess: 42.5 }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('not_an_integer')
  })
})

describe('POST /api/guess — happy path binary search', () => {
  it('reaches correct or out_of_attempts, attemptsRemaining decrements, revealedSecret is null until terminal', async () => {
    const { sessionId, minValue, maxValue, attemptLimit } = await startSession()

    let low = minValue
    let high = maxValue
    let prevAttemptsRemaining = attemptLimit
    let done = false

    while (!done) {
      const currentGuess = Math.floor((low + high) / 2)
      const res = await fetch(GUESS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, guess: currentGuess }),
      })
      expect(res.status).toBe(200)
      const body = await res.json() as {
        result: string
        attemptsUsed: number
        attemptsRemaining: number
        revealedSecret: number | null
      }

      // attemptsRemaining must decrease by 1 each round
      expect(body.attemptsRemaining).toBe(prevAttemptsRemaining - 1)
      prevAttemptsRemaining = body.attemptsRemaining

      if (body.result === 'correct') {
        expect(typeof body.revealedSecret).toBe('number')
        expect(body.revealedSecret).toBe(currentGuess)
        done = true
      } else if (body.result === 'out_of_attempts') {
        expect(typeof body.revealedSecret).toBe('number')
        done = true
      } else {
        // Not terminal — revealedSecret must be null
        expect(body.revealedSecret).toBeNull()
        if (body.result === 'higher') {
          low = currentGuess + 1
        } else {
          high = currentGuess - 1
        }
      }
    }

    expect(done).toBe(true)
  })

  it('returns 400 invalid_session once a finished session is reused', async () => {
    // Force a win on a known secret by exhausting the binary search
    const { sessionId, minValue, maxValue, attemptLimit } = await startSession()

    let low = minValue
    let high = maxValue
    let lastSessionId = sessionId

    for (let i = 0; i < attemptLimit + 2; i++) {
      const currentGuess = Math.floor((low + high) / 2)
      const res = await fetch(GUESS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: lastSessionId, guess: currentGuess }),
      })
      const body = await res.json() as { result?: string; error?: string }
      if (body.result === 'correct' || body.result === 'out_of_attempts') break
      if (body.error === 'invalid_session') break
      if (body.result === 'higher') low = currentGuess + 1
      else if (body.result === 'lower') high = currentGuess - 1
    }

    // Now session should be finished — any further guess must return invalid_session
    const res = await fetch(GUESS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: lastSessionId, guess: 50 }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('invalid_session')
  })
})
