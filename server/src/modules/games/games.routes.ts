import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { getGameController, listGamesController } from './games.controller.js'

export const gamesRouter = Router()

gamesRouter.get('/', asyncHandler(listGamesController))
gamesRouter.get('/:id', asyncHandler(getGameController))
