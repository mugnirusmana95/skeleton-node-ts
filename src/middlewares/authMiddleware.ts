import moment from 'moment'

import { Unauthorized } from '~/helpers/exceptionHelper'

import encryption from '~/helpers/encryptionHelper'

import userTokenRepository from '~/repositories/v1/userTokenRepository'

export const authMiddleware = async (
  req: Req,
  res: Res,
  next: Next
) => {
  const authorization = req.cookies.token

  if (!authorization) {
    throw new Unauthorized('This action need an authentication, login first to access this feature')
  }

  const [tokenType, authToken] = authorization.split(' ')
  if (tokenType !== 'Bearer') {
    throw new Unauthorized('Invalid token or token is expired')
  }

  if (!authToken) {
    throw new Unauthorized('Invalid token or token is expired')
  }

  const { userId, profileId, expiredAt } = encryption.decode(authToken) as { userId: string, profileId: string, expiredAt: Date }

  const userToken = await userTokenRepository.findBy({
    field: 'token',
    value: authToken
  })

  if (!userToken) {
    throw new Unauthorized('Invalid token or token is expired')
  }

  if (!userToken.isActive) {
    throw new Unauthorized('Invalid token or token is expired')
  }

  const isExpired = moment().isAfter(userToken.expiredAt)
  if (isExpired) {
    throw new Unauthorized('Invalid token or token is expired')
  }

  req.auth = {
    token: '',
    userId,
    profileId,
    expiredAt
  }

  next()
}
