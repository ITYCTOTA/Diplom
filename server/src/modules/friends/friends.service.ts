import { pool, query } from '../../db/pool.js'
import { HttpError, notFound } from '../../utils/httpError.js'

type FriendRow = {
  id: string
  nickname: string
  bio: string | null
  created_at: string
}

type RequestRow = {
  id: string
  requester_id: string
  receiver_id: string
  status: string
}

type SearchUserRow = {
  id: string
  nickname: string
  bio: string | null
  relation: string
}

export async function getFriends(userId: string) {
  const result = await query<FriendRow>(
    `
      SELECT u.id, u.nickname, u.bio, f.created_at
      FROM friendships f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = $1
      ORDER BY u.nickname ASC
    `,
    [userId],
  )

  return result.rows.map((row) => ({
    id: row.id,
    nickname: row.nickname,
    bio: row.bio,
    friendsSince: row.created_at,
  }))
}

export async function createFriendRequest(requesterId: string, receiverId: string) {
  if (requesterId === receiverId) {
    throw new HttpError(400, 'Нельзя добавить себя в друзья')
  }

  const userExists = await query('SELECT 1 FROM users WHERE id = $1', [receiverId])

  if ((userExists.rowCount ?? 0) === 0) {
    throw notFound('Пользователь не найден')
  }

  const result = await query<RequestRow>(
    `
      INSERT INTO friend_requests (requester_id, receiver_id)
      VALUES ($1, $2)
      RETURNING id, requester_id, receiver_id, status
    `,
    [requesterId, receiverId],
  )

  return result.rows[0]
}

export async function acceptFriendRequest(userId: string, requestId: string) {
  const requestResult = await query<RequestRow>(
    `
      SELECT id, requester_id, receiver_id, status
      FROM friend_requests
      WHERE id = $1 AND receiver_id = $2
    `,
    [requestId, userId],
  )
  const request = requestResult.rows[0]

  if (!request) {
    throw notFound('Заявка в друзья не найдена')
  }

  if (request.status !== 'pending') {
    throw new HttpError(409, 'Заявка уже обработана')
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await client.query(
      `
        UPDATE friend_requests
        SET status = 'accepted', responded_at = now()
        WHERE id = $1
      `,
      [requestId],
    )
    await client.query(
      `
        INSERT INTO friendships (user_id, friend_id)
        VALUES ($1, $2), ($2, $1)
        ON CONFLICT DO NOTHING
      `,
      [request.requester_id, request.receiver_id],
    )
    await client.query('COMMIT')

    return { status: 'accepted' }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function searchUsers(userId: string, queryText: string) {
  const normalized = queryText.trim()

  if (normalized.length < 2) {
    return []
  }

  const like = `%${normalized}%`
  const result = await query<SearchUserRow>(
    `
      SELECT
        u.id,
        u.nickname,
        u.bio,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM friendships f
            WHERE f.user_id = $2 AND f.friend_id = u.id
          ) THEN 'friend'
          WHEN EXISTS (
            SELECT 1
            FROM friend_requests fr
            WHERE fr.requester_id = $2 AND fr.receiver_id = u.id AND fr.status = 'pending'
          ) THEN 'request_sent'
          WHEN EXISTS (
            SELECT 1
            FROM friend_requests fr
            WHERE fr.requester_id = u.id AND fr.receiver_id = $2 AND fr.status = 'pending'
          ) THEN 'request_received'
          ELSE 'available'
        END AS relation
      FROM users u
      WHERE u.id <> $2
        AND (
          u.nickname ILIKE $1
          OR COALESCE(u.bio, '') ILIKE $1
          OR u.email ILIKE $1
        )
      ORDER BY u.nickname ASC
      LIMIT 20
    `,
    [like, userId],
  )

  return result.rows.map((row) => ({
    id: row.id,
    nickname: row.nickname,
    bio: row.bio,
    relation: row.relation,
  }))
}
