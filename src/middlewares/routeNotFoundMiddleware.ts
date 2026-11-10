import { Request, Response, NextFunction } from 'express'
import { NotFound } from '~/helpers/exceptionHelper'

export const routeNotFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  throw new NotFound('Route or combination beetween route & method not found')
}