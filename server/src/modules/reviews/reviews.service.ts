import { query } from '../../db/pool.js'
import { resolveGameId } from '../../utils/resolveGame.js'

type ReviewRow = {
  id: string
  rating: number
  text: string
  created_at: string
  author_id: string
  author_nickname: string
}

function toReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    text: row.text,
    createdAt: row.created_at,
    author: {
      id: row.author_id,
      nickname: row.author_nickname,
    },
  }
}

export async function getGameReviews(idOrSlug: string) {
  const gameId = await resolveGameId(idOrSlug)
  const result = await query<ReviewRow>(
    `
      SELECT
        r.id,
        r.rating,
        r.text,
        r.created_at,
        u.id AS author_id,
        u.nickname AS author_nickname
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.game_id = $1
      ORDER BY r.created_at DESC
    `,
    [gameId],
  )

  return result.rows.map(toReview)
}

export async function createGameReview(
  userId: string,
  idOrSlug: string,
  rating: number,
  text: string,
) {
  const gameId = await resolveGameId(idOrSlug)
  const result = await query<ReviewRow>(
    `
      INSERT INTO reviews (user_id, game_id, rating, text)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, game_id)
      DO UPDATE SET rating = EXCLUDED.rating, text = EXCLUDED.text, created_at = now()
      RETURNING
        id,
        rating,
        text,
        created_at,
        user_id AS author_id,
        (SELECT nickname FROM users WHERE id = $1) AS author_nickname
    `,
    [userId, gameId, rating, text],
  )

  return toReview(result.rows[0])
}
