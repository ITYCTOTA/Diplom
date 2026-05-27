import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { createActivityController, listActivityController } from './activity.controller.js'

export const activityRouter = Router()

activityRouter.get('/me', authMiddleware, asyncHandler(listActivityController))
activityRouter.post('/me', authMiddleware, asyncHandler(createActivityController))
