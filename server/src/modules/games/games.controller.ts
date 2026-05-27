import type { Request, Response } from 'express'
import { optionalString } from '../../utils/validation.js'
import { getGameByIdOrSlug, getGames } from './games.service.js'

export async function listGamesController(request: Request, response: Response) {
  const search = optionalString(request.query.search)
  const genre = optionalString(request.query.genre)
  const games = await getGames(search, genre)

  response.json({ games })
}

export async function getGameController(request: Request, response: Response) {
  const game = await getGameByIdOrSlug(request.params.id)

  response.json({ game })
}
