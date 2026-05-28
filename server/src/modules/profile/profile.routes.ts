import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { createProfilePostController, profileController } from './profile.controller.js'

export const profileRouter = Router()

profileRouter.get('/me', authMiddleware, asyncHandler(profileController))
profileRouter.post('/me/posts', authMiddleware, asyncHandler(createProfilePostController))
