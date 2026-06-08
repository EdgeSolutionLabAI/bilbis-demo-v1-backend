import { Hono } from 'hono'
import { z } from 'zod'

const feedbackSchema = z.object({
  message: z
    .string()
    .min(1, 'message must not be empty')
    .max(1000, 'message must be 1000 characters or fewer'),
  email: z.string().email('email must be a valid address').optional(),
})

interface FeedbackEntry {
  id: string
  message: string
  email?: string
  createdAt: string
}

// In-memory store keyed by UUID. Acceptable for now per task brief.
const store = new Map<string, FeedbackEntry>()

const feedback = new Hono()

feedback.post('/', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Validation failed'
    return c.json({ error: firstError }, 400)
  }

  const { message, email } = parsed.data
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  const entry: FeedbackEntry = { id, message, createdAt }
  if (email !== undefined) entry.email = email
  store.set(id, entry)

  console.log(
    `[feedback] id=${id} email=${email ?? 'none'} message="${message.length > 80 ? message.slice(0, 80) + '…' : message}"`,
  )

  return c.json({ id, createdAt }, 201)
})

export { feedback }
