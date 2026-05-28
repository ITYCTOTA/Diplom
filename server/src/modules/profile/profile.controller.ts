import type { Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { requireString } from '../../utils/validation.js'
import { createProfilePost, getProfile } from './profile.service.js'

export async function profileController(request: AuthRequest, response: Response) {
  const profile = await getProfile(request.user!.id)

  response.json({ profile })
}

export async function createProfilePostController(request: AuthRequest, response: Response) {
  const text = requireString(request.body.text, 'text')
  const post = await createProfilePost(request.user!.id, text)

  response.status(201).json({ post })
}
