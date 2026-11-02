import { AppDataSource } from "~/configs/dataSource"

import { EUserStatusEntity, User } from '~/entities/userEntity'

import { NotFound } from "~/helpers/exceptionHelper"
import { generateHash, generateRandomText } from "~/helpers/hashHelper"

import { parseParams, TParsedParams } from "~/helpers/paramHelper"

// import profileRepository from "~/repositories/v1/profileRepository"

import {
  TCreateUserBody,
  TUpdateUserBody,
  TChangeStatusUserBody
} from "~/validations/v1/userValidation"

import repositories from '~/repositories'
import { Role } from "~/entities/roleEntity"
import { Profile } from "~/entities/profileEntity"

export default {
  getList: async (req: Req) => {
    const params = parseParams(req)
    return await repositories.getListPaginate(User, params)
  },

  create: async (payload: TCreateUserBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await repositories.findBy(Role, {
        field: 'id',
        value: payload.roleId
      }, trx)
      if (!role) throw new NotFound('Role not found')

      const password = generateRandomText({
        length: 10,
        withCapital: true,
        withSpecialCharacter: true
      })

      const hasedPassword = await generateHash(password)

      const dataUser = await repositories.create(User, {
        email: payload.email,
        password: hasedPassword,
        roleId: role.id,
        status: payload.status ?? EUserStatusEntity.INACTIVE,
      }, trx)

      await repositories.create(Profile, {
        userId: dataUser.id,
        firstName: payload.firstName,
        middleName: payload.middleName,
        lastName: payload.lastName,
        phoneCode: payload.phoneCode,
        phoneNumber: payload.phoneNumber,
        address: payload.address,
      }, trx)

      const user = await repositories.findBy(User, {
        field: 'id',
        value: dataUser.id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
      if (!user) throw new NotFound('User not found')

      return user
    })
  },

  getDetail: async (id: string) => {
    const user = await repositories.findBy(User, {
      field: 'id',
      value: id,
      withRelation: [
        { relation: 'user.profile', alias: 'profile' },
        { relation: 'user.role', alias: 'role' }
      ]
    })
    if (!user) throw new NotFound('User not found')

    return user
  },

  update: async (id: string, data: TUpdateUserBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await repositories.findBy(User, {
        field: 'id',
        value: id
      }, trx)
      if (!user) throw new NotFound('User not found')

      await repositories.updateBy(User, {
        field: 'id',
        value: user.id
      }, {
        email: data.email,
        roleId: data.roleId,
      }, trx)

      return await repositories.findBy(User, {
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
    })
  },

  changeStatus: async (id: string, data: TChangeStatusUserBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await repositories.findBy(User, {
        field: 'id',
        value: id
      }, trx)
      if (!user) throw new NotFound('User not found')

      await repositories.updateBy(User, {
        field: 'id',
        value: user.id
      }, {
        status: data.status,
      }, trx)

      return await repositories.findBy(User, {
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
    })
  },

  resetPassword: async (id: string) => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await repositories.findBy(User, {
        field: 'id',
        value: id
      }, trx)
      if (!user) throw new NotFound('User not found')

      const password = generateRandomText({
        length: 10,
        withCapital: true,
        withSpecialCharacter: true
      })

      const hasedPassword = await generateHash(password)

      await repositories.updateBy(User, {
        field: 'id',
        value: user.id
      }, {
        password: hasedPassword,
      }, trx)

      return await repositories.findBy(User, {
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
    })
  },

  delete: async (id: string) => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await repositories.findBy(User, {
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
      if (!user) throw new NotFound('User not found')

      await repositories.deleteBy(User, {
        field: 'id',
        value: user.id
      }, trx)

      return user
    })
  },

  getByStatus: async (status: number) => {
    return await repositories.getBy(User, {
      field: 'status',
      value: status,
      withSelect: ['profile.id', 'user.id', 'role.id'],
      withRelation: [
        { relation: 'user.profile', alias: 'profile' },
        { relation: 'user.role', alias: 'role' }
      ],
      withOrderBy: [
        { orderBy: 'profile.createdAt', direction: 'DESC' },
        { orderBy: 'role.code' },
        { orderBy: 'role.updatedAt', direction: 'ASC' },
      ],
      withGroupBy: ['profile.id', 'user.id', 'role.id'],
      // withDeleted: true
    })
  },

  permanentDelete: async (id: string) => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await repositories.findBy(User, {
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
      if (!user) throw new NotFound('User not found')

      await repositories.deleteBy(User, {
        field: 'id',
        value: user.id,
        permanentDelete: true
      }, trx)

      return user
    })
  }
}