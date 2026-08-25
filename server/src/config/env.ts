import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) })

function requiredEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function readPort(name: string, fallback: number) {
  const value = Number(process.env[name] ?? fallback)

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Invalid port in environment variable: ${name}`)
  }

  return value
}

const clientPort = readPort('CLIENT_PORT', 5173)
const defaultOrigins = `http://localhost:${clientPort},http://127.0.0.1:${clientPort}`

export const env = {
  port: readPort('API_PORT', 4000),
  databaseUrl: requiredEnv('DATABASE_URL'),
  jwtSecret: requiredEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigins: (process.env.CLIENT_ORIGIN ?? defaultOrigins)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}