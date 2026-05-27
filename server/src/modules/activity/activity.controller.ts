import type { Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { HttpError } from '../../utils/httpError.js'
import { requireString } from '../../utils/validation.js'
import { createActivity, getUserActivity } from './activity.service.js'

export async function listActivityController(request: AuthRequest, response: Response) {
  const activity = await getUserActivity(request.user!.id)

  response.json({ activity })
}

export async function createActivityController(request: AuthRequest, response: Response) {
  const gameId = requireString(request.body.gameId, 'gameId')
  const activityDate = requireString(request.body.activityDate, 'activityDate')
  const minutes = Number(request.body.minutes)

  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new HttpError(400, 'minutes должен быть неотрицательным целым числом')
  }

  const activity = await createActivity(request.user!.id, gameId, activityDate, minutes)

  response.status(201).json({ activity })
}
