export class AppError extends Error {
  public readonly status: number
  public readonly isOperational: boolean
  public readonly field?: Record<string, unknown>

  constructor(message: string, status: number, isOperational = true, fieldError?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.isOperational = isOperational
    this.field = fieldError
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this)
  }
}

export class BadRequest extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400)
  }
}

export class Unauthorized extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
  }
}

export class UnprocessableEntity extends AppError {
  constructor(
    message: string = 'Unprocessable Entity',
    field?: Record<string, unknown>,
  ) {
    super(message, 422, true, field)
  }
}

export class Forbidden extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
  }
}

export class NotFound extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404)
  }
}

export class InternalServer extends AppError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500, false)
  }
}
