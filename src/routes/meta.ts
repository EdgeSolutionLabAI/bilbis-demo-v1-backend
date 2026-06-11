import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Read version once at boot from package.json so it reflects the deployed build.
const pkgPath = fileURLToPath(new URL('../../package.json', import.meta.url))
const { version } = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string }

const commit = process.env.GIT_SHA ?? 'dev'
const buildTime = new Date().toISOString()

const meta = new Hono()

meta.use(cors({ origin: 'https://bilbis-demo-v1-frontend.vercel.app' }))

// TODO (KAI-52): Add OpenAPI spec entry for this endpoint once OpenAPI is wired up.
meta.get('/version', (c) => {
  c.header('Cache-Control', 'public, max-age=60')
  return c.json({ version, commit, buildTime })
})

// Simple version endpoint that returns just the git SHA
const simpleVersion = new Hono()
simpleVersion.get('/', (c) => {
  return c.json({ version: process.env.GIT_SHA ?? 'unknown' })
})

export { meta, simpleVersion }
