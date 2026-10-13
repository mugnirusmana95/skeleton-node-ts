import bcrypt from 'bcrypt'
import { randomInt } from 'node:crypto'

type TOptionGenerateRandomText = {
  length?: number
  withCapital?: boolean
  withNumber?: boolean
  withSpecialCharacter?: boolean
}

export const generateRandomText = (options?: TOptionGenerateRandomText): string => {
  const length = options?.length ?? 5
  const withCapital = options?.withCapital ?? false
  const withNumber = options?.withNumber ?? true
  const withSpecialCharacter = options?.withSpecialCharacter ?? false

  const CHAR = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const CHAR_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const NUMBER = '0123456789'
  const SPECIAL_CHAR = '!@#$%^&*'

  let characters = CHAR

  if (withCapital) {
    characters += CHAR_UPPER
  }

  if (withNumber) {
    characters += NUMBER
  }

  if (withSpecialCharacter) {
    characters += SPECIAL_CHAR
  }

  return Array.from({ length }, () =>
    characters[randomInt(length)],
  ).join('')
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