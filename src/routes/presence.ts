import { Hono } from 'hono'
import { cors } from 'hono/cors'

const ACTIVE_WINDOW_MS = 60_000   // visitors seen within this window count as active
const SWEEP_INTERVAL_MS = 30_000  // how often stale entries are purged
const MAX_AGE_MS = 5 * 60_000     // entries older than this are dropped by the sweep

const sessions = new Map<string, number>()

// Purge entries that haven't been seen for MAX_AGE_MS so the map doesn't grow unboundedly.
// unref() lets the process exit cleanly even if the interval is still pending.
setInterval(() => {
  const cutoff = Date.now() - MAX_AGE_MS
  for (const [id, lastSeen] of sessions) {
    if (lastSeen < cutoff) sessions.delete(id)
  }
}, SWEEP_INTERVAL_MS).unref()

function countActive(): number {
  const cutoff = Date.now() - ACTIVE_WINDOW_MS
  let count = 0
  for (const lastSeen of sessions.values()) {
    if (lastSeen > cutoff) count++
  }
  return count
}

const presence = new Hono()

presence.use(cors({ origin: 'https://bilbis-demo-v1-frontend.vercel.app' }))

presence.post('/heartbeat', async (c) => {
  const body = await c.req.json<{ visitorId?: unknown }>()
  const { visitorId } = body ?? {}

  if (typeof visitorId !== 'string' || visitorId.length < 1 || visitorId.length > 64) {
    return c.json({ error: 'visitorId must be a string of 1–64 characters' }, 400)
  }

  sessions.set(visitorId, Date.now())

  return c.json({ ok: true, activeCount: countActive() })
})

presence.get('/active', (c) => {
  return c.json({ activeCount: countActive() })
})

export { presence }
