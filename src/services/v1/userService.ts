import { Request } from "express"

import { AppDataSource } from "~/configs/dataSource"

import { EUserStatusEntity } from '~/entities/userEntity'

import { NotFound } from "~/exceptions"
import { generateHash, generateRandomText } from "~/helpers/hashHelper"

import { parseParams } from "~/helpers/paramHelper"

import roleRepository from "~/repositories/v1/roleRepository"
import userRepository, {
  TResGetListPaginateUser,
  TResFindUser,
  TResGetUser,
} from "~/repositories/v1/userRepository"
import profileRepository from "~/repositories/v1/profileRepository"

import {
  TCreateUserBody,
  TUpdateUserBody,
  TChangeStatusUserBody
} from "~/validations/v1/userValidation"


export default {
  getList: async (req: Req): TResGetListPaginateUser => {
    const params = parseParams(req)
    return await userRepository.getListPaginate(params)
  },

  create: async (payload: TCreateUserBody): TResFindUser => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await roleRepository.findBy({
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

      const dataUser = await userRepository.create({
        email: payload.email,
        password: hasedPassword,
        roleId: role.id,
        status: payload.status ?? EUserStatusEntity.INACTIVE,
      }, trx)

      await profileRepository.create({
        userId: dataUser.id,
        firstName: payload.firstName,
        middleName: payload.middleName,
        lastName: payload.lastName,
        phoneCode: payload.phoneCode,
        phoneNumber: payload.phoneNumber,
        address: payload.address,
      }, trx)

      const user = await userRepository.findBy({
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

  getDetail: async (id: string): TResFindUser => {
    const user = await userRepository.findBy({
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

  update: async (id: string, data: TUpdateUserBody): TResFindUser => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await userRepository.findBy({
        field: 'id',
        value: id
      }, trx)
      if (!user) throw new NotFound('User not found')

      await userRepository.updateBy({
        field: 'id',
        value: user.id
      }, {
        email: data.email,
        roleId: data.roleId,
      }, trx)

      return await userRepository.findBy({
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
    })
  },

  changeStatus: async (id: string, data: TChangeStatusUserBody): TResFindUser => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await userRepository.findBy({
        field: 'id',
        value: id
      }, trx)
      if (!user) throw new NotFound('User not found')

      await userRepository.updateBy({
        field: 'id',
        value: user.id
      }, {
        status: data.status,
      }, trx)

      return await userRepository.findBy({
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
    })
  },

  resetPassword: async (id: string): TResFindUser => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await userRepository.findBy({
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

      await userRepository.updateBy({
        field: 'id',
        value: user.id
      }, {
        password: hasedPassword,
      }, trx)

      return await userRepository.findBy({
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
    })
  },

  delete: async (id: string): TResFindUser => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await userRepository.findBy({
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
      if (!user) throw new NotFound('User not found')

      await userRepository.deleteBy({
        field: 'id',
        value: user.id
      }, trx)

      return user
    })
  },

  getByStatus: async (status: number): TResGetUser => {
    // return await userRepository.get({
    //   where: {
    //     condition: 'status = :status',
    //     value: { status }
    //   },
    //   withSelect: ['profile.id', 'user.id', 'role.id'],
    //   withRelation: [
    //     { relation: 'user.profile', alias: 'profile' },
    //     { relation: 'user.role', alias: 'role' }
    //   ],
    //   withOrderBy: [
    //     { orderBy: 'profile.id', direction: 'DESC' },
    //     { orderBy: 'user.id' },
    //     { orderBy: 'role.id', direction: 'ASC' },
    //   ],
    //   withGroupBy: ['profile.id', 'user.id', 'role.id'],
    //   withDeleted: true
    // })

    return await userRepository.getBy({
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

  permanentDelete: async (id: string): TResFindUser => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await userRepository.findBy({
        field: 'id',
        value: id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' }
        ]
      }, trx)
      if (!user) throw new NotFound('User not found')

      await userRepository.deleteBy({
        field: 'id',
        value: user.id,
        permanentDelete: true
      }, trx)

      return user
    })
  }
}