import moment from 'moment'
import { EntityManager } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { BadRequest, NotFound } from '~/exceptions'

import { User, EUserStatusEntity } from '~/entities/userEntity'
import { EUserTokenTypeEntity } from '~/entities/userTokenEntity'

import encryption from '~/helpers/encryptionHelper'
import { compareHash, generateHash, generateRandomText } from '~/helpers/hashHelper'

import userTokenRepository from '~/repositories/v1/userTokenRepository'
import userRepository, { TResFindUser } from '~/repositories/v1/userRepository'

import {
  TActivationRequestBody,
  TActivationSubmitBody,
  TChangePasswordRequestBody,
  TChangePasswordSubmitBody,
  TLoginAuthBody
} from "~/validations/v1/authValidation"

const generateToken = async (userId: string, trx?: EntityManager) => {
  if (!userId || userId === "") throw new NotFound('Credential does not match or account not found')

  const user = await userRepository.findBy({
    field: 'id',
    value: userId,
    withRelation: [
      { relation: 'user.profile', alias: 'profile' },
      { relation: 'user.role', alias: 'role' },
    ]
  }, trx)

  if (!user) throw new NotFound('Credential does not match or account not found')

  const expiredDays = process.env.EXPIRED_AUTH_TOKEN ?? 7
  const tokenExpiredAt = moment().add(expiredDays, 'days')
  const token = encryption.encode({
    userId: user.id,
    profileId: user.profile.id,
    expiredAt: tokenExpiredAt.toISOString()
  })

  await userTokenRepository.update(
    {
      where: {
        condition: 'userToken.userId = :userId AND userToken.type = :userType',
        value: {
          userId: user.id,
          userType: EUserTokenTypeEntity.AUTH,
        }
      },
    },
    {
      isActive: false
    }
    , trx
  )

  await userTokenRepository.create(
    {
      userId: user.id,
      type: EUserTokenTypeEntity.AUTH,
      isActive: true,
      token: token,
      expiredAt: tokenExpiredAt.toDate()
    },
    trx
  )

  return {
    token: {
      type: 'Bearer',
      value: token,
      expiredAt: tokenExpiredAt.toDate()
    },
    user
  }
}

export default {
  login: async (payload: TLoginAuthBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const { username, password } = payload
      const data = await userRepository.find({
        where: {
          condition: 'user.email = :username',
          value: { username }
        },
        withAddSelect: ['user.password']
      }, trx)

      if (!data) throw new NotFound('Credential does not match or account not found')
      if (data.status !== EUserStatusEntity.ACTIVE) {
        if (data.status === EUserStatusEntity.INACTIVE) {
          throw new BadRequest('Your account is inactive, please activate first')
        }

        if (data.status === EUserStatusEntity.DISABLED) {
          throw new BadRequest('Your account is disabled, contact admin to re-active your account')
        }

        if (data.status === EUserStatusEntity.BANNED) {
          throw new BadRequest('Your account is banned')
        }

        throw new BadRequest('Your account status is invalid, please contact admin')
      }

      const statusCompare = await compareHash(password, data.password)
      if (!statusCompare) throw new BadRequest('Credential does not match or account not found')

      return await generateToken(data.id, trx)
    })
  },

  refreshToken: async (req: Req) => {
    return await AppDataSource.transaction(async (trx) => {
      const userId = String(req?.auth?.userId)

      const data = await userRepository.findBy({
        field: 'id',
        value: userId,
        withAddSelect: ['user.password']
      }, trx)

      if (!data) throw new NotFound('Credential does not match or account not found')
      if (data.status !== EUserStatusEntity.ACTIVE) {
        if (data.status === EUserStatusEntity.INACTIVE) {
          throw new BadRequest('Your account is inactive, please activate first')
        }

        if (data.status === EUserStatusEntity.DISABLED) {
          throw new BadRequest('Your account is disabled, contact admin to re-active your account')
        }

        if (data.status === EUserStatusEntity.BANNED) {
          throw new BadRequest('Your account is banned')
        }

        throw new BadRequest('Your account status is invalid, please contact admin')
      }

      return await generateToken(data.id, trx)
    })
  },

  activationRequest: async (payload: TActivationRequestBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const { email } = payload

      const user = await userRepository.findBy({
        field: 'email',
        value: email
      }, trx)
      if (!user) throw new NotFound('User not found')

      if (user.status !== EUserStatusEntity.INACTIVE) {
        if (user.status === EUserStatusEntity.ACTIVE) throw new BadRequest('Your account is already active')
        if (user.status === EUserStatusEntity.DISABLED) throw new BadRequest('Your account is disabled, contact admin to re-active your account')
        if (user.status === EUserStatusEntity.BANNED) throw new BadRequest('Your account is banned')

        throw new BadRequest('Your account status is invalid, please contact admin')
      }

      const expiredMinute = Number(process.env.EXPIRED_CODE_TOKEN ?? 30)
      const tokenExpiredAt = moment().add(expiredMinute, 'minutes')

      const token = generateRandomText({
        length: 5,
        withCapital: false,
        withNumber: true,
        withSpecialCharacter: false
      })

      await userTokenRepository.update(
        {
          where: {
            condition: 'userToken.userId = :userId AND userToken.type = :userType',
            value: {
              userId: user.id,
              userType: EUserTokenTypeEntity.ACCOUUNT_ACTIVATION,
            }
          },
        },
        {
          isActive: false
        }
        , trx
      )

      await userTokenRepository.create(
        {
          userId: user.id,
          type: EUserTokenTypeEntity.ACCOUUNT_ACTIVATION,
          isActive: true,
          token,
          expiredAt: tokenExpiredAt.toDate(),
        },
        trx,
      )

      //send email notification here with url and token

      //send email notification here with url and token

      return null
    })
  },

  activationSubmit: async (payload: TActivationSubmitBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const { code } = payload

      const userToken = await userTokenRepository.findBy({
        field: 'token',
        value: code
      }, trx)
      if (!userToken || !userToken.isActive) {
        throw new BadRequest('Invalid token or token is expired')
      }

      const isExpired = moment().isAfter(userToken.expiredAt)
      if (isExpired) {
        throw new BadRequest('Invalid token or token is expired')
      }

      const user = await userRepository.findBy({
        field: 'id',
        value: userToken.userId,
      }, trx)
      if (!user) throw new NotFound('User not found')
      if (user.status !== EUserStatusEntity.INACTIVE) {
        if (user.status === EUserStatusEntity.ACTIVE) throw new BadRequest('Your account is already active')
        if (user.status === EUserStatusEntity.DISABLED) throw new BadRequest('Your account is disabled, contact admin to re-active your account')
        if (user.status === EUserStatusEntity.BANNED) throw new BadRequest('Your account is banned')

        throw new BadRequest('Your account status is invalid, please contact admin')
      }

      await userTokenRepository.update(
        {
          where: {
            condition: 'userToken.userId = :userId AND userToken.type = :userType',
            value: {
              userId: user.id,
              userType: EUserTokenTypeEntity.ACCOUUNT_ACTIVATION,
            }
          },
        },
        {
          isActive: false
        }
        , trx
      )

      await userRepository.updateBy(
        {
          field: 'id',
          value: userToken.userId,
        },
        {
          status: EUserStatusEntity.ACTIVE
        },
        trx
      )

      return null
    })
  },

  changePasswordRequest: async (payload: TChangePasswordRequestBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const { email } = payload

      const user = await userRepository.findBy({
        field: 'email',
        value: email
      }, trx)
      if (!user) throw new NotFound('User not found')

      if (user.status !== EUserStatusEntity.ACTIVE) {
        if (user.status === EUserStatusEntity.INACTIVE) throw new BadRequest('Your account is inactive, please activate first')
        if (user.status === EUserStatusEntity.DISABLED) throw new BadRequest('Your account is disabled, contact admin to re-active your account')
        if (user.status === EUserStatusEntity.BANNED) throw new BadRequest('Your account is banned')

        throw new BadRequest('Your account status is invalid, please contact admin')
      }

      const expiredMinute = Number(process.env.EXPIRED_CODE_TOKEN ?? 30)
      const tokenExpiredAt = moment().add(expiredMinute, 'minutes')

      const token = generateRandomText({
        length: 5,
        withCapital: false,
        withNumber: true,
        withSpecialCharacter: false
      })

      await userTokenRepository.update(
        {
          where: {
            condition: 'userToken.userId = :userId AND userToken.type = :userType',
            value: {
              userId: user.id,
              userType: EUserTokenTypeEntity.CHANGE_PASSWORD,
            }
          },
        },
        {
          isActive: false
        }
        , trx
      )

      await userTokenRepository.create(
        {
          userId: user.id,
          type: EUserTokenTypeEntity.CHANGE_PASSWORD,
          isActive: true,
          token: token,
          expiredAt: tokenExpiredAt.toDate()
        },
        trx
      )

      //send email notification here with url and token

      //send email notification here with url and token

      return null
    })
  },

  changePasswordSubmit: async (payload: TChangePasswordSubmitBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const { code, password } = payload

      const userToken = await userTokenRepository.findBy({
        field: 'token',
        value: code
      }, trx)
      if (!userToken || !userToken.isActive) {
        throw new BadRequest('Invalid token or token is expired')
      }

      const isExpired = moment().isAfter(userToken.expiredAt)
      if (isExpired) {
        throw new BadRequest('Invalid token or token is expired')
      }

      const user = await userRepository.findBy({
        field: 'id',
        value: userToken.userId,
      }, trx)
      if (!user) throw new NotFound('User not found')

      if (user.status !== EUserStatusEntity.ACTIVE) {
        if (user.status === EUserStatusEntity.INACTIVE) throw new BadRequest('Your account is inactive, please activate first')
        if (user.status === EUserStatusEntity.DISABLED) throw new BadRequest('Your account is disabled, contact admin to re-active your account')
        if (user.status === EUserStatusEntity.BANNED) throw new BadRequest('Your account is banned')

        throw new BadRequest('Your account status is invalid, please contact admin')
      }

      await userTokenRepository.update(
        {
          where: {
            condition: 'userToken.userId = :userId AND userToken.type = :userType',
            value: {
              userId: user.id,
              userType: EUserTokenTypeEntity.CHANGE_PASSWORD,
            }
          },
        },
        {
          isActive: false
        }
        , trx
      )

      const hashedPassword = await generateHash(password)

      await userRepository.updateBy(
        {
          field: 'id',
          value: userToken.userId,
        },
        {
          password: hashedPassword
        },
        trx
      )

      return null
    })
  },

  logout: async (req: Req) => {
    return await AppDataSource.transaction(async (trx) => {
      const userId = String(req?.auth?.userId)

      await userTokenRepository.update(
        {
          where: {
            condition: 'userToken.userId = :userId AND userToken.type = :userType',
            value: {
              userId: userId,
              userType: EUserTokenTypeEntity.AUTH,
            }
          },
        },
        {
          isActive: false
        },
        trx
      )

      return null
    })
  }
}