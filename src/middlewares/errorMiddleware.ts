
import { AppError } from '~/helpers/exceptionHelper'

import { response } from '~/helpers/responseHelper'

export const errorMiddleware = (
  err: Error,
  req: Req,
  res: Res,
  next: Next
) => {
  if (process?.env?.MODE !== 'production') console.error('[ERROR] => ', err)

  const globalErrorMessage = process?.env?.MODE === 'producton'
    ? 'Internal server error'
    : err?.message ?? 'Error'

  if (err instanceof AppError) {
    let errorObject: {
      status: number,
      message: string
      field?: Record<string, unknown>
    } = {
      status: err.status,
      message: globalErrorMessage,
    }

    if (err.status === 400 || err.status === 422) {
      if (err.field) {
        errorObject.field = err.field as Record<string, unknown>
      }
    }

    if (err.status >= 500) {
      errorObject.message = globalErrorMessage
    }

    return response(res, errorObject)
  }

  return response(res, {
    status: 500,
    message: globalErrorMessage,
  })
}
