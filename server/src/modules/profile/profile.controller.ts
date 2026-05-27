import type { Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { getProfile } from './profile.service.js'

export async function profileController(request: AuthRequest, response: Response) {
  const profile = await getProfile(request.user!.id)

  response.json({ profile })
}
