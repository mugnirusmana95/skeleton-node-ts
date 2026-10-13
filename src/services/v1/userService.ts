import { Request } from "express"

import { AppDataSource } from "~/configs/dataSource"

import { EUserStatusEntity } from '~/entities/userEntity'

import { NotFound } from "~/exceptions"
import { generateHash, generateRandomText } from "~/helpers/hashHelper"

import { parseParams } from "~/helpers/paramHelper"

import roleRepository from "~/repositories/v1/roleRepository"
import userRepository, {
  TResGetListPaginateUser,
  TResFindUser
} from "~/repositories/v1/userRepository"

import {
  TCreateUserBody,
  TUpdateUserBody,
  TChangeStatusUserBody
} from "~/validations/v1/userValidation"


export default {
  getList: async (req: Request): TResGetListPaginateUser => {
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
      console.log('password ', password)
      const hasedPassword = await generateHash(password)

      const data = await userRepository.create({
        email: payload.email,
        password: hasedPassword,
        roleId: role.id,
        status: payload.status ?? EUserStatusEntity.INACTIVE,
      }, trx)

      const user = await userRepository.findBy({
        field: 'id',
        value: data.id,
        withRole: true
      }, trx)
      if (!user) throw new NotFound('User not found')

      return user
    })
  },

  getDetail: async (id: string): TResFindUser => {
    const user = await userRepository.findBy({
      field: 'id',
      value: id,
      withRole: true
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
        withRole: true
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
        withRole: true
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
      console.log('password ', password)
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
        withRole: true
      }, trx)
    })
  },

  delete: async (id: string): TResFindUser => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await userRepository.findBy({
        field: 'id',
        value: id,
        withRole: true
      }, trx)
      if (!user) throw new NotFound('User not found')

      await userRepository.deleteBy({
        field: 'id',
        value: user.id
      }, trx)

      return user
    })
  },

  permanentDelete: async (id: string): TResFindUser => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await userRepository.findBy({
        field: 'id',
        value: id,
        withRole: true
      }, trx)
      if (!user) throw new NotFound('User not found')

      await userRepository.permanentDeleteBy({
        field: 'id',
        value: user.id
      }, trx)

      return user
    })
  }
}