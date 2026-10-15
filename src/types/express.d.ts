
import type { Request, Response, NextFunction } from 'express'

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
    }
  }

  type Req = Request
  type Res = Response
  type Next = NextFunction
}

export { }
