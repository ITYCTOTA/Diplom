import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { profileController } from './profile.controller.js'

export const profileRouter = Router()

profileRouter.get('/me', authMiddleware, asyncHandler(profileController))
