import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { loginController, meController, registerController } from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', asyncHandler(registerController))
authRouter.post('/login', asyncHandler(loginController))
authRouter.get('/me', authMiddleware, asyncHandler(meController))
