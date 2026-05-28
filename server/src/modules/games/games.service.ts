import { query } from '../../db/pool.js'
import { notFound } from '../../utils/httpError.js'

export type GameDto = {
  id: string
  slug: string
  title: string
  description: string
  priceCents: number
  rating: number
  coverUrl: string | null
  coverTone: string
  coverToneTwo: string
  genres: string[]
  tags: string[]
}

type GameRow = {
  id: string
  slug: string
  title: string
  description: string
  price_cents: number
  rating: string
  cover_url: string | null
  cover_tone: string
  cover_tone_two: string
  genres: string[]
  tags: string[]
}

function toGameDto(row: GameRow): GameDto {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    priceCents: row.price_cents,
    rating: Number(row.rating),
    coverUrl: row.cover_url,
    coverTone: row.cover_tone,
    coverToneTwo: row.cover_tone_two,
    genres: row.genres ?? [],
    tags: row.tags ?? [],
  }
}

const gameSelect = `
  SELECT
    g.id,
    g.slug,
    g.title,
    g.description,
    g.price_cents,
    g.rating,
    g.cover_url,
    g.cover_tone,
    g.cover_tone_two,
    COALESCE(array_agg(DISTINCT ge.name) FILTER (WHERE ge.name IS NOT NULL), '{}') AS genres,
    COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
  FROM games g
  LEFT JOIN game_genres gg ON gg.game_id = g.id
  LEFT JOIN genres ge ON ge.id = gg.genre_id
  LEFT JOIN game_tags gt ON gt.game_id = g.id
  LEFT JOIN tags t ON t.id = gt.tag_id
`

export async function getGames(search?: string, genre?: string) {
  const params: unknown[] = []
  const where: string[] = []

  if (search) {
    params.push(`%${search}%`)
    where.push(`g.title ILIKE $${params.length}`)
  }

  if (genre) {
    params.push(genre)
    where.push(`EXISTS (
      SELECT 1
      FROM game_genres fgg
      JOIN genres fge ON fge.id = fgg.genre_id
      WHERE fgg.game_id = g.id AND fge.name = $${params.length}
    )`)
  }

  const result = await query<GameRow>(
    `
      ${gameSelect}
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY g.id
      ORDER BY g.rating DESC, g.title ASC
    `,
    params,
  )

  return result.rows.map(toGameDto)
}

export async function getGameByIdOrSlug(idOrSlug: string) {
  const result = await query<GameRow>(
    `
      ${gameSelect}
      WHERE g.id::text = $1 OR g.slug = $1
      GROUP BY g.id
      LIMIT 1
    `,
    [idOrSlug],
  )
  const row = result.rows[0]

  if (!row) {
    throw notFound('Игра не найдена')
  }

  return toGameDto(row)
}
