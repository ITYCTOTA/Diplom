import { query } from '../../db/pool.js'
import { notFound } from '../../utils/httpError.js'

type ProfileRow = {
  id: string
  email: string
  nickname: string
  bio: string | null
  created_at: string
  wallet_balance_cents: number
  library_count: string
  total_minutes: string
  friends_count: string
  posts_count: string
  favorite_game_title: string | null
}

type ProfilePostRow = {
  id: string
  text: string
  created_at: string
}

function toProfilePost(row: ProfilePostRow) {
  return {
    id: row.id,
    text: row.text,
    createdAt: row.created_at,
  }
}

export async function getProfile(userId: string) {
  const profileResult = await query<ProfileRow>(
    `
      SELECT
        u.id,
        u.email,
        u.nickname,
        u.bio,
        u.created_at,
        u.wallet_balance_cents,
        (SELECT COUNT(*) FROM library_items li WHERE li.user_id = u.id) AS library_count,
        COALESCE((SELECT SUM(minutes) FROM game_activity ga WHERE ga.user_id = u.id), 0) AS total_minutes,
        (SELECT COUNT(*) FROM friendships f WHERE f.user_id = u.id) AS friends_count,
        (SELECT COUNT(*) FROM user_posts up WHERE up.user_id = u.id) AS posts_count,
        (
          SELECT g.title
          FROM game_activity ga
          JOIN games g ON g.id = ga.game_id
          WHERE ga.user_id = u.id
          GROUP BY g.id
          ORDER BY SUM(ga.minutes) DESC
          LIMIT 1
        ) AS favorite_game_title
      FROM users u
      WHERE u.id = $1
    `,
    [userId],
  )
  const row = profileResult.rows[0]

  if (!row) {
    throw notFound('Пользователь не найден')
  }

  const postsResult = await query<ProfilePostRow>(
    `
      SELECT
        up.id,
        up.text,
        up.created_at
      FROM user_posts up
      WHERE up.user_id = $1
      ORDER BY up.created_at DESC
      LIMIT 6
    `,
    [userId],
  )

  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    bio: row.bio,
    createdAt: row.created_at,
    walletBalanceCents: row.wallet_balance_cents,
    stats: {
      libraryCount: Number(row.library_count),
      totalMinutes: Number(row.total_minutes),
      friendsCount: Number(row.friends_count),
      postsCount: Number(row.posts_count),
      favoriteGameTitle: row.favorite_game_title,
    },
    posts: postsResult.rows.map(toProfilePost),
  }
}

export async function createProfilePost(userId: string, text: string) {
  const result = await query<ProfilePostRow>(
    `
      INSERT INTO user_posts (user_id, text)
      VALUES ($1, $2)
      RETURNING id, text, created_at
    `,
    [userId, text],
  )

  return toProfilePost(result.rows[0])
}
