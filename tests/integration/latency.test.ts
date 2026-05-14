import { describe, expect, it } from 'vitest'
import { BASE_URL, withOrigin } from './setup.js'

const MAX_LATENCY_MS = 3_000

const ENDPOINTS: Array<{ label: string; path: string; init?: RequestInit }> = [
  { label: 'GET /health', path: '/health' },
  {
    label: 'GET /api/v1/meta/version',
    path: '/api/v1/meta/version',
    init: { headers: withOrigin() },
  },
  { label: 'GET /api/v1/image/random', path: '/api/v1/image/random' },
]

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

async function measureLatency(path: string, init?: RequestInit): Promise<number> {
  const start = performance.now()
  await fetch(`${BASE_URL}${path}`, init)
  return performance.now() - start
}

describe('endpoint latency', () => {
  for (const { label, path, init } of ENDPOINTS) {
    it(`${label} responds within ${MAX_LATENCY_MS}ms`, async () => {
      // Five samples to expose intermittent slowness and derive basic percentiles.
      const samples: number[] = []
      for (let i = 0; i < 5; i++) {
        samples.push(await measureLatency(path, init))
      }
      samples.sort((a, b) => a - b)

      const p50 = percentile(samples, 50)
      const p95 = percentile(samples, 95)
      const max = samples[samples.length - 1]

      // Emit stats so CI logs capture them even on success.
      console.log(`${label} — p50: ${p50.toFixed(0)}ms  p95: ${p95.toFixed(0)}ms  max: ${max.toFixed(0)}ms`)

      expect(max).toBeLessThan(MAX_LATENCY_MS)
    }, MAX_LATENCY_MS * 5 + 2_000) // vitest timeout = 5 samples × max + buffer
  }
})
