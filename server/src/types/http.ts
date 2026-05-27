import type { Request } from 'express'

export type AuthUser = {
  id: string
  email: string
  nickname: string
}

export type AuthRequest = Request & {
  user?: AuthUser
}
