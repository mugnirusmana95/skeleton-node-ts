
import { BadRequest } from '~/helpers/exceptionHelper'

export const unAuthMiddleware = async (
  req: Req,
  res: Res,
  next: Next
) => {
  const authorization = req.cookies.token

  if (authorization) {
    throw new BadRequest('This action need an un-authentication, logout first to access this feature')
  }

  next()
}
