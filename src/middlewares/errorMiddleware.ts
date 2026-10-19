
import { logger } from '~/configs/logger'
import { AppError } from '~/helpers/exceptionHelper'
import { response } from '~/helpers/responseHelper'

export const errorMiddleware = (
  err: Error,
  req: Req,
  res: Res,
  next: Next,
) => {
  const isProduction = process.env.MODE === 'production'
  const status = err instanceof AppError ? err.status : 500

  const message = isProduction
    ? 'Internal server error'
    : err.message || 'Error'

  const logContext = {
    url: req.originalUrl,
    method: req.method,
    payload: {
      query: res.locals.requestContext?.query,
      params: res.locals.requestContext?.params,
      body: res.locals.requestContext?.body,
    },
    auth: res.locals.requestContext?.auth ?? {},
    err,
    status,
  }

  console.log('logContext ', logContext)

  if (status >= 500) {
    logger.error(logContext, err.message)
  } else {
    logger.warn(logContext, err.message)
  }

  const errorObject: {
    status: number
    message: string
    field?: Record<string, unknown>
  } = {
    status,
    message,
  }

  if (
    err instanceof AppError &&
    (status === 400 || status === 422) &&
    err.field
  ) {
    errorObject.field = err.field as Record<string, unknown>
  }

  return response(res, errorObject)
}
