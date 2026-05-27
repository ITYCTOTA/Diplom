import type { ErrorRequestHandler } from 'express'
import { HttpError } from '../utils/httpError.js'

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next

  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message })
    return
  }

  console.error(error)
  response.status(500).json({ message: 'Внутренняя ошибка сервера' })
}
