import { query } from '../../db/pool.js'
import type { GameDto } from '../games/games.service.js'

type LibraryRow = {
  id: string
  slug: string
  title: string
  description: string
  price_cents: number
  rating: string
  cover_url: string | null
  cover_tone: string
  cover_tone_two: string
  added_at: string
  genres: string[]
  tags: string[]
}

function toLibraryItem(row: LibraryRow) {
  const game: GameDto = {
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

  return { game, addedAt: row.added_at }
}

export async function getUserLibrary(userId: string) {
  const result = await query<LibraryRow>(
    `
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
        li.added_at,
        COALESCE(array_agg(DISTINCT ge.name) FILTER (WHERE ge.name IS NOT NULL), '{}') AS genres,
        COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
      FROM library_items li
      JOIN games g ON g.id = li.game_id
      LEFT JOIN game_genres gg ON gg.game_id = g.id
      LEFT JOIN genres ge ON ge.id = gg.genre_id
      LEFT JOIN game_tags gt ON gt.game_id = g.id
      LEFT JOIN tags t ON t.id = gt.tag_id
      WHERE li.user_id = $1
      GROUP BY g.id, li.added_at
      ORDER BY li.added_at DESC
    `,
    [userId],
  )

  return result.rows.map(toLibraryItem)
}
