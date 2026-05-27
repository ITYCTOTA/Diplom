import { query } from '../../db/pool.js'

type ProfileRow = {
  id: string
  email: string
  nickname: string
  bio: string | null
  created_at: string
  library_count: string
  total_minutes: string
  friends_count: string
  posts_count: string
  favorite_game_title: string | null
}

export async function getProfile(userId: string) {
  const result = await query<ProfileRow>(
    `
      SELECT
        u.id,
        u.email,
        u.nickname,
        u.bio,
        u.created_at,
        (SELECT COUNT(*) FROM library_items li WHERE li.user_id = u.id) AS library_count,
        COALESCE((SELECT SUM(minutes) FROM game_activity ga WHERE ga.user_id = u.id), 0) AS total_minutes,
        (SELECT COUNT(*) FROM friendships f WHERE f.user_id = u.id) AS friends_count,
        (SELECT COUNT(*) FROM group_posts gp WHERE gp.author_id = u.id) AS posts_count,
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
  const row = result.rows[0]

  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    bio: row.bio,
    createdAt: row.created_at,
    stats: {
      libraryCount: Number(row.library_count),
      totalMinutes: Number(row.total_minutes),
      friendsCount: Number(row.friends_count),
      postsCount: Number(row.posts_count),
      favoriteGameTitle: row.favorite_game_title,
    },
  }
}
