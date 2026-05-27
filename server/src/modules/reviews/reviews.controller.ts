import type { Request, Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { requireRating, requireString } from '../../utils/validation.js'
import { createGameReview, getGameReviews } from './reviews.service.js'

export async function listReviewsController(request: Request, response: Response) {
  const reviews = await getGameReviews(request.params.gameId)

  response.json({ reviews })
}

export async function createReviewController(request: AuthRequest, response: Response) {
  const rating = requireRating(request.body.rating)
  const text = requireString(request.body.text, 'text')
  const review = await createGameReview(request.user!.id, request.params.gameId, rating, text)

  response.status(201).json({ review })
}
