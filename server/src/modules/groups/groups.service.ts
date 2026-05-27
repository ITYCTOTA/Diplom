import { query } from '../../db/pool.js'
import { notFound } from '../../utils/httpError.js'

type GroupRow = {
  id: string
  slug: string
  title: string
  description: string
  cover_tone: string
  cover_tone_two: string
  created_at: string
  members_count: string
  posts_count: string
}

type GroupPostRow = {
  id: string
  title: string
  text: string
  created_at: string
  author_id: string | null
  author_nickname: string | null
  likes_count: string
  comments_count: string
}

function toGroup(row: GroupRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverTone: row.cover_tone,
    coverToneTwo: row.cover_tone_two,
    createdAt: row.created_at,
    membersCount: Number(row.members_count),
    postsCount: Number(row.posts_count),
  }
}

function toGroupPost(row: GroupPostRow) {
  return {
    id: row.id,
    title: row.title,
    text: row.text,
    createdAt: row.created_at,
    author: row.author_id
      ? {
          id: row.author_id,
          nickname: row.author_nickname,
        }
      : null,
    likesCount: Number(row.likes_count),
    commentsCount: Number(row.comments_count),
  }
}

async function resolveGroupId(idOrSlug: string) {
  const result = await query<{ id: string }>(
    'SELECT id FROM groups WHERE id::text = $1 OR slug = $1 LIMIT 1',
    [idOrSlug],
  )
  const row = result.rows[0]

  if (!row) {
    throw notFound('Группа не найдена')
  }

  return row.id
}

export async function getGroups() {
  const result = await query<GroupRow>(
    `
      SELECT
        g.id,
        g.slug,
        g.title,
        g.description,
        g.cover_tone,
        g.cover_tone_two,
        g.created_at,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS members_count,
        (SELECT COUNT(*) FROM group_posts gp WHERE gp.group_id = g.id) AS posts_count
      FROM groups g
      ORDER BY members_count DESC, g.title ASC
    `,
  )

  return result.rows.map(toGroup)
}

export async function getGroup(idOrSlug: string) {
  const groupId = await resolveGroupId(idOrSlug)
  const groupResult = await query<GroupRow>(
    `
      SELECT
        g.id,
        g.slug,
        g.title,
        g.description,
        g.cover_tone,
        g.cover_tone_two,
        g.created_at,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS members_count,
        (SELECT COUNT(*) FROM group_posts gp WHERE gp.group_id = g.id) AS posts_count
      FROM groups g
      WHERE g.id = $1
    `,
    [groupId],
  )
  const group = groupResult.rows[0]

  if (!group) {
    throw notFound('Группа не найдена')
  }

  const postsResult = await query<GroupPostRow>(
    `
      SELECT
        gp.id,
        gp.title,
        gp.text,
        gp.created_at,
        u.id AS author_id,
        u.nickname AS author_nickname,
        (SELECT COUNT(*) FROM group_likes gl WHERE gl.post_id = gp.id) AS likes_count,
        (SELECT COUNT(*) FROM group_comments gc WHERE gc.post_id = gp.id) AS comments_count
      FROM group_posts gp
      LEFT JOIN users u ON u.id = gp.author_id
      WHERE gp.group_id = $1
      ORDER BY gp.created_at DESC
    `,
    [groupId],
  )

  return {
    ...toGroup(group),
    posts: postsResult.rows.map(toGroupPost),
  }
}

export async function joinGroup(userId: string, idOrSlug: string) {
  const groupId = await resolveGroupId(idOrSlug)

  await query(
    `
      INSERT INTO group_members (group_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `,
    [groupId, userId],
  )

  return getGroup(groupId)
}

export async function leaveGroup(userId: string, idOrSlug: string) {
  const groupId = await resolveGroupId(idOrSlug)

  await query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [groupId, userId])

  return getGroup(groupId)
}

export async function createGroupPost(userId: string, idOrSlug: string, title: string, text: string) {
  const groupId = await resolveGroupId(idOrSlug)
  const result = await query<GroupPostRow>(
    `
      INSERT INTO group_posts (group_id, author_id, title, text)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        title,
        text,
        created_at,
        author_id,
        (SELECT nickname FROM users WHERE id = $2) AS author_nickname,
        '0' AS likes_count,
        '0' AS comments_count
    `,
    [groupId, userId, title, text],
  )

  return toGroupPost(result.rows[0])
}

export async function createGroupComment(userId: string, postId: string, text: string) {
  const result = await query(
    `
      INSERT INTO group_comments (post_id, author_id, text)
      VALUES ($1, $2, $3)
      RETURNING id, post_id, author_id, text, created_at
    `,
    [postId, userId, text],
  )

  return result.rows[0]
}

export async function toggleGroupLike(userId: string, postId: string) {
  const existing = await query('SELECT 1 FROM group_likes WHERE post_id = $1 AND user_id = $2', [
    postId,
    userId,
  ])

  if ((existing.rowCount ?? 0) > 0) {
    await query('DELETE FROM group_likes WHERE post_id = $1 AND user_id = $2', [postId, userId])
    return { liked: false }
  }

  await query('INSERT INTO group_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId])
  return { liked: true }
}
