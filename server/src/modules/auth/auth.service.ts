import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { query } from '../../db/pool.js'
import type { AuthUser } from '../../types/http.js'
import { HttpError, notFound } from '../../utils/httpError.js'

type UserRow = {
  id: string
  email: string
  password_hash: string
  nickname: string
  wallet_balance_cents: number
}

type PublicUser = {
  id: string
  email: string
  nickname: string
  walletBalanceCents: number
}

function publicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    walletBalanceCents: row.wallet_balance_cents,
  }
}

function tokenUser(user: PublicUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
  }
}

function signToken(user: AuthUser) {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  }

  return jwt.sign(user, env.jwtSecret, options)
}

export async function registerUser(email: string, password: string, nickname: string) {
  const existing = await query<UserRow>('SELECT * FROM users WHERE email = $1', [email])

  if ((existing.rowCount ?? 0) > 0) {
    throw new HttpError(409, 'Пользователь с таким email уже существует')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const result = await query<UserRow>(
    `
      INSERT INTO users (email, password_hash, nickname)
      VALUES ($1, $2, $3)
      RETURNING id, email, password_hash, nickname, wallet_balance_cents
    `,
    [email, passwordHash, nickname],
  )
  const user = publicUser(result.rows[0])

  return { user, token: signToken(tokenUser(user)) }
}

export async function loginUser(email: string, password: string) {
  const result = await query<UserRow>('SELECT * FROM users WHERE email = $1', [email])
  const row = result.rows[0]

  if (!row) {
    throw new HttpError(401, 'Неверный email или пароль')
  }

  const passwordMatches = await bcrypt.compare(password, row.password_hash)

  if (!passwordMatches) {
    throw new HttpError(401, 'Неверный email или пароль')
  }

  const user = publicUser(row)

  return { user, token: signToken(tokenUser(user)) }
}

export async function getCurrentUser(userId: string) {
  const result = await query<UserRow>(
    `
      SELECT
        id,
        email,
        password_hash,
        nickname,
        wallet_balance_cents
      FROM users
      WHERE id = $1
    `,
    [userId],
  )
  const row = result.rows[0]

  if (!row) {
    throw notFound('Пользователь не найден')
  }

  return publicUser(row)
}
