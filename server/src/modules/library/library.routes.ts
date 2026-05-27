import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { getLibraryController } from './library.controller.js'

export const libraryRouter = Router()

libraryRouter.get('/', authMiddleware, asyncHandler(getLibraryController))
