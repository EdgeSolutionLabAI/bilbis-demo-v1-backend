import { Hono } from 'hono'

export interface Match {
  id: string
  team1: string
  team2: string
  /** ISO-8601 datetime string */
  time: string
  event: string
  format: string
}

// PandaScore free-tier CS2 API — requires PANDASCORE_API_KEY env var
const PANDASCORE_BASE = 'https://api.pandascore.co/csgo/matches'

interface PandaScoreOpponent {
  opponent: { name: string }
}

interface PandaScoreMatch {
  id: number
  scheduled_at: string | null
  tournament: { name: string } | null
  match_type: string | null
  number_of_games: number | null
  opponents: PandaScoreOpponent[]
}

function toFormatString(type: string | null, games: number | null): string {
  if (type === 'best_of' && games != null) return `BO${games}`
  return 'BO3'
}

async function fetchTodayMatches(): Promise<Match[]> {
  const apiKey = process.env.PANDASCORE_API_KEY
  if (!apiKey) {
    console.warn('PANDASCORE_API_KEY not configured — returning empty match list')
    return []
  }

  // Compute today's UTC date range dynamically — never hardcode a date
  const now = new Date()
  const today = now.toISOString().slice(0, 10) // "YYYY-MM-DD"
  const rangeStart = `${today}T00:00:00Z`
  const rangeEnd = `${today}T23:59:59Z`

  const url = new URL(PANDASCORE_BASE)
  url.searchParams.set('range[scheduled_at]', `${rangeStart},${rangeEnd}`)
  url.searchParams.set('per_page', '100')

  let res: Response
  try {
    res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    })
  } catch (err) {
    console.error('PandaScore fetch failed:', err)
    return []
  }

  if (!res.ok) {
    console.error(`PandaScore API error: ${res.status} ${res.statusText}`)
    return []
  }

  const data: PandaScoreMatch[] = await res.json()

  return data
    .filter((m) => m.scheduled_at != null && m.opponents.length >= 2)
    .map((m) => ({
      id: String(m.id),
      team1: m.opponents[0].opponent.name,
      team2: m.opponents[1].opponent.name,
      time: m.scheduled_at as string,
      event: m.tournament?.name ?? 'Unknown Event',
      format: toFormatString(m.match_type, m.number_of_games),
    }))
}

const matches = new Hono()

matches.get('/today', async (c) => {
  const todayMatches = await fetchTodayMatches()
  // Prevent caching so every request reflects the actual current day
  c.header('Cache-Control', 'no-store')
  return c.json(todayMatches)
})

export { matches }
