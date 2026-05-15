import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { guess } from './routes/guess.js'
import { health } from './routes/health.js'
import { image } from './routes/image.js'
import { meta } from './routes/meta.js'
import { presence } from './routes/presence.js'

const app = new Hono()

// Normalize paths with consecutive slashes (e.g. //api/v1/… → /api/v1/…) so that
// misconfigured clients sending a double-slash base URL don't hit Vercel's 308 redirect,
// which strips CORS headers and breaks preflight requests.
app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  const normalized = url.pathname.replace(/\/{2,}/g, '/')
  if (normalized !== url.pathname) {
    url.pathname = normalized
    return c.redirect(url.toString(), 307)
  }
  return next()
})

app.route('/health', health)
app.route('/api/guess', guess)
app.route('/api/v1/meta', meta)
app.route('/api/v1/presence', presence)
app.route('/api/v1/image', image)

app.get('/api/bacon', async (c) => {
  const width = c.req.query('width') ?? '300'
  const height = c.req.query('height') ?? '300'

  const upstream = await fetch(`https://baconmockup.com/${width}/${height}/`)
  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
  const body = await upstream.arrayBuffer()

  return new Response(body, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  })
})

app.use('/*', serveStatic({ root: './public' }))

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
