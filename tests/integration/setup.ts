/** Base URL for all integration requests. Override with API_BASE_URL env var. */
export const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000'

/** Production frontend origin — sent as Origin header to trigger CORS response headers. */
export const FE_ORIGIN = 'https://bilbis-demo-v1-frontend.vercel.app'

/** Build a Headers object that includes the production FE origin so CORS middleware fires. */
export function withOrigin(extra?: HeadersInit): HeadersInit {
  return { Origin: FE_ORIGIN, ...extra }
}

/**
 * Assert that a response carries the expected CORS allow-origin header for the
 * FE origin. Only routes that mount hono/cors middleware will satisfy this.
 */
export function assertCorsAllowOrigin(res: Response): void {
  const header = res.headers.get('Access-Control-Allow-Origin')
  if (header !== FE_ORIGIN && header !== '*') {
    throw new Error(
      `Expected Access-Control-Allow-Origin to be "${FE_ORIGIN}" or "*", got "${header}"`,
    )
  }
}
