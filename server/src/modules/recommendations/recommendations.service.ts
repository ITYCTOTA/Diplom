import { query } from '../../db/pool.js'
import type { GameDto } from '../games/games.service.js'

type RecommendationRow = {
  id: string
  slug: string
  title: string
  description: string
  price_cents: number
  rating: string
  cover_tone: string
  cover_tone_two: string
  genres: string[]
  tags: string[]
  score: number
}

function toRecommendation(row: RecommendationRow) {
  const game: GameDto = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    priceCents: row.price_cents,
    rating: Number(row.rating),
    coverTone: row.cover_tone,
    coverToneTwo: row.cover_tone_two,
    genres: row.genres ?? [],
    tags: row.tags ?? [],
  }

  return {
    game,
    score: Number(row.score),
    reason: 'Подбор по жанрам, тегам, библиотеке и недавней активности',
  }
}

export async function getRecommendations(userId: string) {
  const result = await query<RecommendationRow>(
    `
      WITH favorite_genres AS (
        SELECT gg.genre_id
        FROM library_items li
        JOIN game_genres gg ON gg.game_id = li.game_id
        WHERE li.user_id = $1
      ),
      favorite_tags AS (
        SELECT gt.tag_id
        FROM library_items li
        JOIN game_tags gt ON gt.game_id = li.game_id
        WHERE li.user_id = $1
      ),
      activity_games AS (
        SELECT game_id
        FROM game_activity
        WHERE user_id = $1 AND activity_date >= CURRENT_DATE - INTERVAL '14 days'
      )
      SELECT
        g.id,
        g.slug,
        g.title,
        g.description,
        g.price_cents,
        g.rating,
        g.cover_tone,
        g.cover_tone_two,
        COALESCE(array_agg(DISTINCT ge.name) FILTER (WHERE ge.name IS NOT NULL), '{}') AS genres,
        COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags,
        (
          COUNT(DISTINCT fg.genre_id) * 2 +
          COUNT(DISTINCT ft.tag_id) * 3 +
          COUNT(DISTINCT ag.game_id)
        ) AS score
      FROM games g
      LEFT JOIN game_genres gg ON gg.game_id = g.id
      LEFT JOIN genres ge ON ge.id = gg.genre_id
      LEFT JOIN game_tags gt ON gt.game_id = g.id
      LEFT JOIN tags t ON t.id = gt.tag_id
      LEFT JOIN favorite_genres fg ON fg.genre_id = gg.genre_id
      LEFT JOIN favorite_tags ft ON ft.tag_id = gt.tag_id
      LEFT JOIN activity_games ag ON ag.game_id = g.id
      WHERE NOT EXISTS (
        SELECT 1 FROM library_items li WHERE li.user_id = $1 AND li.game_id = g.id
      )
      GROUP BY g.id
      ORDER BY score DESC, g.rating DESC
      LIMIT 8
    `,
    [userId],
  )

  return result.rows.map(toRecommendation)
}
