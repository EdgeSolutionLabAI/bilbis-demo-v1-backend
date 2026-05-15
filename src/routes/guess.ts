import { Hono } from 'hono'
import { z } from 'zod'

const MIN_VALUE = 1
const MAX_VALUE = 100
const ATTEMPT_LIMIT = 7

interface GameState {
  secret: number
  attemptsUsed: number
  finished: boolean
}

// In-memory session store — resets on server restart by design.
const sessions = new Map<string, GameState>()

const GuessBodySchema = z.object({
  sessionId: z.string(),
  guess: z.number(),
})

const guess = new Hono()

guess.post('/session', (c) => {
  const sessionId = crypto.randomUUID()
  const secret =
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE

  sessions.set(sessionId, { secret, attemptsUsed: 0, finished: false })

  return c.json({
    sessionId,
    minValue: MIN_VALUE,
    maxValue: MAX_VALUE,
    attemptLimit: ATTEMPT_LIMIT,
  })
})

guess.post('/', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'invalid_body' }, 400)
  }

  const parsed = GuessBodySchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'invalid_body' }, 400)
  }

  const { sessionId, guess: guessValue } = parsed.data

  const session = sessions.get(sessionId)
  if (!session || session.finished) {
    return c.json({ error: 'invalid_session' }, 400)
  }

  if (!Number.isInteger(guessValue)) {
    return c.json({ error: 'not_an_integer' }, 400)
  }

  if (guessValue < MIN_VALUE || guessValue > MAX_VALUE) {
    return c.json({ error: 'out_of_range' }, 400)
  }

  session.attemptsUsed += 1
  const attemptsUsed = session.attemptsUsed
  const attemptsRemaining = ATTEMPT_LIMIT - attemptsUsed

  if (guessValue === session.secret) {
    session.finished = true
    return c.json({
      result: 'correct',
      attemptsUsed,
      attemptsRemaining,
      revealedSecret: session.secret,
    })
  }

  if (attemptsUsed === ATTEMPT_LIMIT) {
    session.finished = true
    return c.json({
      result: 'out_of_attempts',
      attemptsUsed,
      attemptsRemaining: 0,
      revealedSecret: session.secret,
    })
  }

  const result = guessValue < session.secret ? 'higher' : 'lower'
  return c.json({
    result,
    attemptsUsed,
    attemptsRemaining,
    revealedSecret: null,
  })
})

export { guess }
