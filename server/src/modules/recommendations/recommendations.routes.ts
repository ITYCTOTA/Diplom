import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { recommendationsController } from './recommendations.controller.js'

export const recommendationsRouter = Router()

recommendationsRouter.get('/', authMiddleware, asyncHandler(recommendationsController))
