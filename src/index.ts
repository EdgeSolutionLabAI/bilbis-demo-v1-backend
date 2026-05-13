import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { meta } from './routes/meta.js'

const app = new Hono()

app.route('/api/v1/meta', meta)

app.get('/', (c) => {
  return c.text('Bilbis Demo V1')
})

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

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
