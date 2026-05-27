import dotenv from 'dotenv'

dotenv.config()

function requiredEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: requiredEnv('DATABASE_URL'),
  jwtSecret: requiredEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}
