import type { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { AuthRequest, AuthUser } from '../types/http.js'
import { HttpError } from '../utils/httpError.js'

export function authMiddleware(request: AuthRequest, _response: Response, next: NextFunction) {
  const header = request.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Требуется авторизация'))
    return
  }

  try {
    request.user = jwt.verify(header.slice(7), env.jwtSecret) as AuthUser
    next()
  } catch {
    next(new HttpError(401, 'Недействительный токен авторизации'))
  }
}
