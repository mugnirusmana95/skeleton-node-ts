import bcrypt from 'bcrypt'
import { randomInt } from 'node:crypto'
import { InternalServer } from '~/helpers/exceptionHelper'

type TOptionGenerateRandomText = {
  length?: number
  withCapital?: boolean
  withNumber?: boolean
  withSpecialCharacter?: boolean
}

export const generateRandomText = (
  options?: TOptionGenerateRandomText,
): string => {
  const length = options?.length ?? 5
  const withCapital = options?.withCapital ?? false
  const withNumber = options?.withNumber ?? true
  const withSpecialCharacter = options?.withSpecialCharacter ?? false

  const CHAR = 'abcdefghijklmnopqrstuvwxyz'
  const CHAR_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const NUMBER = '0123456789'
  const SPECIAL_CHAR = '!@#$%^&*'

  let characters = CHAR

  if (withCapital) characters += CHAR_UPPER
  if (withNumber) characters += NUMBER
  if (withSpecialCharacter) characters += SPECIAL_CHAR

  if (length < 1) {
    throw new InternalServer('Length must be at least 1')
  }

  if (withNumber && length < 1) {
    throw new InternalServer('Length must be at least 1 to include a number')
  }

  const result = Array.from({ length }, () =>
    characters[randomInt(characters.length)],
  )

  if (withNumber) {
    result[randomInt(length)] = NUMBER[randomInt(NUMBER.length)]
  }

  return result.join('')
}

export const generateHash = async (value: string): Promise<string> => {
  const SALT_ROUNDS = 10
  return bcrypt.hash(value, SALT_ROUNDS)
}

export const compareHash = async (
  value: string,
  hashedValue: string,
): Promise<boolean> => {
  return bcrypt.compare(value, hashedValue)
}