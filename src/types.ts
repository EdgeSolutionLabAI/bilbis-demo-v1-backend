import { z } from 'zod'

export const CoinFlipResponseSchema = z.object({
  result: z.enum(['heads', 'tails']),
  flipId: z.string(),
})

export type CoinFlipResponse = z.infer<typeof CoinFlipResponseSchema>
