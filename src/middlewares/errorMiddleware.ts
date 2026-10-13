import { Request, Response, NextFunction } from 'express'

import { AppError } from '~/exceptions'

import { response } from '~/helpers/responseHelper'

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return response(res, {
      status: err.status,
      message: err.message,
    })
  }

  return response(res, {
    status: 500,
    message: err?.message ?? 'Error',
  })
}
