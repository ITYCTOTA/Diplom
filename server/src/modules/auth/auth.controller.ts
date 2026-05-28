import type { Request, Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { requireString } from '../../utils/validation.js'
import { getCurrentUser, loginUser, registerUser } from './auth.service.js'

export async function registerController(request: Request, response: Response) {
  const email = requireString(request.body.email, 'email').toLowerCase()
  const password = requireString(request.body.password, 'password')
  const nickname = requireString(request.body.nickname, 'nickname')
  const result = await registerUser(email, password, nickname)

  response.status(201).json(result)
}

export async function loginController(request: Request, response: Response) {
  const email = requireString(request.body.email, 'email').toLowerCase()
  const password = requireString(request.body.password, 'password')
  const result = await loginUser(email, password)

  response.json(result)
}

export async function meController(request: AuthRequest, response: Response) {
  const user = await getCurrentUser(request.user!.id)

  response.json({ user })
}
