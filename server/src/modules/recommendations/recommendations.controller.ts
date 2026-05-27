import type { Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { getRecommendations } from './recommendations.service.js'

export async function recommendationsController(request: AuthRequest, response: Response) {
  const recommendations = await getRecommendations(request.user!.id)

  response.json({ recommendations })
}
