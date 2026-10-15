
import { AppError } from '~/exceptions'

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
      message: err.message,
    }

    if (err.status === 422) {
      errorObject.field = err.field as Record<string, unknown>
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
