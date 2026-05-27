import { query } from '../db/pool.js'
import { notFound } from './httpError.js'

type GameIdRow = {
  id: string
}

export async function resolveGameId(idOrSlug: string) {
  const result = await query<GameIdRow>(
    'SELECT id FROM games WHERE id::text = $1 OR slug = $1 LIMIT 1',
    [idOrSlug],
  )
  const row = result.rows[0]

  if (!row) {
    throw notFound('Игра не найдена')
  }

  return row.id
}
