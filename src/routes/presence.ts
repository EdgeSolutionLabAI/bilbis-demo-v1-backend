// presence.ts

import { Hono } from 'hono'
import { cors } from 'hono/cors'

const presence = new Hono()

presence.use(cors({ origin: 'https://bilbis-demo-v1-frontend.vercel.app' }))

// Define presence routes here

export { presence }