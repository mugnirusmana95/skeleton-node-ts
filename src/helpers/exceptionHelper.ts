export class AppError extends Error {
  public readonly status: number
  public readonly field?: Record<string, unknown>

  constructor(message: string, status: number, fieldError?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.field = fieldError
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this)
  }
}

export class BadRequest extends AppError {
  constructor(
    message: string = 'Bad Request',
    field?: Record<string, unknown>,
  ) {
    super(message, 400, field)
  }
}

export class Unauthorized extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
  }
}

export class Forbidden extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
  }
}

export class UnprocessableEntity extends AppError {
  constructor(
    message: string = 'Unprocessable Entity',
    field?: Record<string, unknown>,
  ) {
    super(message, 422, field)
  }
}

export class NotFound extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404)
  }
}

export class InternalServer extends AppError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500)
  }
}
