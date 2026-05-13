import { Hono } from 'hono'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Read version once at boot from package.json so it reflects the deployed build.
const pkgPath = fileURLToPath(new URL('../../package.json', import.meta.url))
const { version } = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string }

const commit = process.env.GIT_SHA ?? 'dev'
const buildTime = new Date().toISOString()

const meta = new Hono()

// TODO (KAI-52): Add OpenAPI spec entry for this endpoint once OpenAPI is wired up.
meta.get('/version', (c) => {
  c.header('Cache-Control', 'public, max-age=60')
  return c.json({ version, commit, buildTime })
})

export { meta }
