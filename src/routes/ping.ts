import { Hono } from 'hono'

const ping = new Hono()

ping.get('/', (c) => {
  return c.json({ ok: true, timestamp: new Date().toISOString() })
})

export { ping }
