import { timingSafeEqual } from 'node:crypto'
import { InternalServer } from '~/helpers/exceptionHelper'

type TEncodedPayload = {
  salt: string
  data: unknown
}

const SALT = String(process.env.ENCRYPTION_SALT)

const encode = (data: unknown): string => {
  if (!SALT) {
    throw new InternalServer('Enryption Salt is no defined yet')
  }
  const payload: TEncodedPayload = { data, salt: SALT }

  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')
}

const decode = <T = unknown>(
  encoded: string,
): T => {
  if (!SALT) {
    throw new InternalServer('Enryption Salt is no defined yet')
  }

  const payload = JSON.parse(
    Buffer.from(encoded, 'base64').toString('utf8')
  ) as TEncodedPayload

  if (typeof payload.salt !== 'string') {
    throw new InternalServer('Invalid encoded payload')
  }

  const actualSalt = Buffer.from(payload.salt, 'utf8')
  const expected = Buffer.from(SALT, 'utf8')

  if (
    actualSalt.length !== expected.length ||
    !timingSafeEqual(actualSalt, expected)
  ) {
    throw new InternalServer('Invalid decode token')
  }

  return payload.data as T
}

export default {
  encode,
  decode
}