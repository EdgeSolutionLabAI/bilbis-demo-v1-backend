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

// Mock data representing today's CS2 matches (static demo dataset).
const TODAY_MATCHES: Match[] = [
  {
    id: 'm-001',
    team1: 'Natus Vincere',
    team2: 'FaZe Clan',
    time: '2026-06-05T13:00:00Z',
    event: 'ESL Pro League Season 21',
    format: 'BO3',
  },
  {
    id: 'm-002',
    team1: 'Team Vitality',
    team2: 'G2 Esports',
    time: '2026-06-05T16:00:00Z',
    event: 'ESL Pro League Season 21',
    format: 'BO3',
  },
  {
    id: 'm-003',
    team1: 'Astralis',
    team2: 'Cloud9',
    time: '2026-06-05T19:00:00Z',
    event: 'BLAST Premier Spring Finals',
    format: 'BO1',
  },
]

const matches = new Hono()

matches.get('/today', (c) => {
  return c.json(TODAY_MATCHES)
})

export { matches }
