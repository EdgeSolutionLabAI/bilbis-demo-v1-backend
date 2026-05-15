import { Hono } from 'hono'
import { CoinFlipResponseSchema } from '../types.js'

const coinFlip = new Hono()

coinFlip.post('/', (c) => {
  const result = Math.random() < 0.5 ? 'heads' : 'tails'
  const flipId = crypto.randomUUID()
  const body = CoinFlipResponseSchema.parse({ result, flipId })
  return c.json(body)
})

export { coinFlip }
