
import type { Request, Response, NextFunction } from 'express'
import { TLanguageMiddleware } from '~/middlewares/languageMiddleware'

declare global {
  namespace Express {
    interface Request {
      auth?: {
        token: string
        userId: string
        profileId: string
        expiredAt: Date
      },
      timezone: string
      language: TLanguageMiddleware
    }
  }

  type Req = Request
  type Res = Response
  type Next = NextFunction
}

export { }
