export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function notFound(message = 'Ресурс не найден') {
  return new HttpError(404, message)
}
