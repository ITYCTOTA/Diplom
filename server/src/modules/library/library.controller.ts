import type { Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { getUserLibrary } from './library.service.js'

export async function getLibraryController(request: AuthRequest, response: Response) {
  const library = await getUserLibrary(request.user!.id)

  response.json({ library })
}
