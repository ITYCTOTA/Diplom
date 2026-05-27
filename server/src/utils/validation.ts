import { HttpError } from './httpError.js'

export function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `Поле ${field} обязательно`)
  }

  return value.trim()
}

export function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

export function requireRating(value: unknown) {
  const rating = Number(value)

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, 'Оценка должна быть целым числом от 1 до 5')
  }

  return rating
}
