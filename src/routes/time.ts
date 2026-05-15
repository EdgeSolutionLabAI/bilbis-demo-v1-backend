import { Hono } from 'hono'

const time = new Hono()

time.get('/', (c) => {
  const now = Date.now()
  return c.json({ iso: new Date(now).toISOString(), epochMs: now })
})

export { time }
