import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { createPurchaseController } from './purchases.controller.js'

export const purchasesRouter = Router()

purchasesRouter.post('/:gameId', authMiddleware, asyncHandler(createPurchaseController))
