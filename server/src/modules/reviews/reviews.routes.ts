import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { createReviewController, listReviewsController } from './reviews.controller.js'

export const reviewsRouter = Router()

reviewsRouter.get('/:gameId/reviews', asyncHandler(listReviewsController))
reviewsRouter.post('/:gameId/reviews', authMiddleware, asyncHandler(createReviewController))
