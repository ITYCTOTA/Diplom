import { pool, query } from '../../db/pool.js'
import { resolveGameId } from '../../utils/resolveGame.js'

type PriceRow = {
  price_cents: number
}

export async function createPurchase(userId: string, idOrSlug: string) {
  const gameId = await resolveGameId(idOrSlug)
  const priceResult = await query<PriceRow>('SELECT price_cents FROM games WHERE id = $1', [gameId])
  const amountCents = priceResult.rows[0].price_cents
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const purchase = await client.query(
      `
        INSERT INTO purchases (user_id, game_id, amount_cents, status)
        VALUES ($1, $2, $3, 'completed')
        RETURNING id, user_id, game_id, amount_cents, status, purchased_at
      `,
      [userId, gameId, amountCents],
    )
    await client.query(
      `
        INSERT INTO library_items (user_id, game_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `,
      [userId, gameId],
    )
    await client.query('COMMIT')

    return purchase.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
