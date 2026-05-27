import type { Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { createPurchase } from './purchases.service.js'

export async function createPurchaseController(request: AuthRequest, response: Response) {
  const purchase = await createPurchase(request.user!.id, request.params.gameId)

  response.status(201).json({ purchase })
}
