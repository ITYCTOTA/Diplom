import { query } from '../../db/pool.js'
import { resolveGameId } from '../../utils/resolveGame.js'

type ActivityRow = {
  id: string
  game_id: string
  game_title: string
  activity_date: string
  minutes: number
}

function toActivity(row: ActivityRow) {
  return {
    id: row.id,
    gameId: row.game_id,
    gameTitle: row.game_title,
    activityDate: row.activity_date,
    minutes: row.minutes,
  }
}

export async function getUserActivity(userId: string) {
  const result = await query<ActivityRow>(
    `
      SELECT
        ga.id,
        ga.game_id,
        g.title AS game_title,
        ga.activity_date,
        ga.minutes
      FROM game_activity ga
      JOIN games g ON g.id = ga.game_id
      WHERE ga.user_id = $1
      ORDER BY ga.activity_date DESC
      LIMIT 90
    `,
    [userId],
  )

  return result.rows.map(toActivity)
}

export async function createActivity(userId: string, idOrSlug: string, activityDate: string, minutes: number) {
  const gameId = await resolveGameId(idOrSlug)
  const result = await query<ActivityRow>(
    `
      INSERT INTO game_activity (user_id, game_id, activity_date, minutes)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        game_id,
        (SELECT title FROM games WHERE id = $2) AS game_title,
        activity_date,
        minutes
    `,
    [userId, gameId, activityDate, minutes],
  )

  return toActivity(result.rows[0])
}
