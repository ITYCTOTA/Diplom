import { randomUUID } from 'node:crypto'
import { pool, query } from '../../db/pool.js'
import { HttpError, notFound } from '../../utils/httpError.js'

type GroupRow = {
  id: string
  slug: string
  title: string
  description: string
  cover_tone: string
  cover_tone_two: string
  created_at: string
  creator_id: string | null
  creator_nickname: string | null
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

type GroupCommentRow = {
  id: string
  post_id: string
  text: string
  created_at: string
  author_id: string | null
  author_nickname: string | null
}

const groupPalettes: Array<[string, string]> = [
  ['#8B5CF6', '#38BDF8'],
  ['#22C55E', '#38BDF8'],
  ['#F59E0B', '#8B5CF6'],
  ['#FB7185', '#F59E0B'],
  ['#5B7CFA', '#22C55E'],
  ['#14B8A6', '#8B5CF6'],
]

function hashText(value: string) {
  let hash = 0

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0
  }

  return Math.abs(hash)
}

function pickGroupPalette(seed: string): [string, string] {
  return groupPalettes[hashText(seed) % groupPalettes.length]
}

function buildGroupSlug() {
  return `group-${randomUUID().slice(0, 8)}`
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
    creator: row.creator_id
      ? {
          id: row.creator_id,
          nickname: row.creator_nickname,
        }
      : null,
    membersCount: Number(row.members_count),
    postsCount: Number(row.posts_count),
  }
}

function toGroupComment(row: GroupCommentRow) {
  return {
    id: row.id,
    text: row.text,
    createdAt: row.created_at,
    author: row.author_id
      ? {
          id: row.author_id,
          nickname: row.author_nickname,
        }
      : null,
  }
}

function toGroupPost(row: GroupPostRow, comments: ReturnType<typeof toGroupComment>[] = []) {
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
    comments,
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
        creator.id AS creator_id,
        creator.nickname AS creator_nickname,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS members_count,
        (SELECT COUNT(*) FROM group_posts gp WHERE gp.group_id = g.id) AS posts_count
      FROM groups g
      LEFT JOIN users creator ON creator.id = g.creator_id
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
        creator.id AS creator_id,
        creator.nickname AS creator_nickname,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS members_count,
        (SELECT COUNT(*) FROM group_posts gp WHERE gp.group_id = g.id) AS posts_count
      FROM groups g
      LEFT JOIN users creator ON creator.id = g.creator_id
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
  const commentsResult = await query<GroupCommentRow>(
    `
      SELECT
        gc.id,
        gc.post_id,
        gc.text,
        gc.created_at,
        u.id AS author_id,
        u.nickname AS author_nickname
      FROM group_comments gc
      JOIN group_posts gp ON gp.id = gc.post_id
      LEFT JOIN users u ON u.id = gc.author_id
      WHERE gp.group_id = $1
      ORDER BY gc.created_at ASC
    `,
    [groupId],
  )
  const commentsByPost = new Map<string, ReturnType<typeof toGroupComment>[]>()

  for (const comment of commentsResult.rows) {
    const postComments = commentsByPost.get(comment.post_id) ?? []
    postComments.push(toGroupComment(comment))
    commentsByPost.set(comment.post_id, postComments)
  }

  return {
    ...toGroup(group),
    posts: postsResult.rows.map((post) => toGroupPost(post, commentsByPost.get(post.id) ?? [])),
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

export async function createGroup(userId: string, title: string, description: string) {
  const slug = buildGroupSlug()
  const [coverTone, coverToneTwo] = pickGroupPalette(`${userId}:${title}`)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const groupResult = await client.query<{ id: string }>(
      `
        INSERT INTO groups (slug, title, description, creator_id, cover_tone, cover_tone_two)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [slug, title, description, userId, coverTone, coverToneTwo],
    )
    const groupId = groupResult.rows[0]?.id

    if (!groupId) {
      throw new HttpError(500, 'РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕР·РґР°С‚СЊ РіСЂСѓРїРїСѓ')
    }

    await client.query(
      `
        INSERT INTO group_members (group_id, user_id, role)
        VALUES ($1, $2, 'creator')
        ON CONFLICT DO NOTHING
      `,
      [groupId, userId],
    )
    await client.query('COMMIT')

    return getGroup(groupId)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function createGroupPost(userId: string, idOrSlug: string, title: string, text: string) {
  const groupId = await resolveGroupId(idOrSlug)
  const creatorResult = await query<{ creator_id: string }>(
    'SELECT creator_id FROM groups WHERE id = $1',
    [groupId],
  )
  const creator = creatorResult.rows[0]

  if (!creator || creator.creator_id !== userId) {
    throw new HttpError(403, 'Публиковать посты может только создатель группы')
  }

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
