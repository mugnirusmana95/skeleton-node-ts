import { Request } from "express"

import { AppDataSource } from "~/configs/dataSource"

import { BadRequest, NotFound } from "~/exceptions"

import { parseParams } from "~/helpers/paramHelper"

import roleRepository, {
  TResGetListPaginateRole,
  TResFindRole,
} from "~/repositories/v1/roleRepository"
import userRepository from "~/repositories/v1/userRepository"

import {
  TCreateRoleBody,
  TUpdateRoleBody,
  TActivationRoleBody
} from "~/validations/v1/roleValidation"

export default {
  getList: async (req: Req): TResGetListPaginateRole => {
    const params = parseParams(req)
    return await roleRepository.getListPaginate(params)
  },

  create: async (payload: TCreateRoleBody): TResFindRole => {
    return await AppDataSource.transaction(async (trx) => {
      const data = await roleRepository.create({
        ...payload,
        isActive: true
      }, trx)

      return await roleRepository.findBy({
        field: 'id',
        value: data.id
      }, trx)
    })
  },

  getDetail: async (id: string): TResFindRole => {
    const role = await roleRepository.findBy({
      field: 'id',
      value: id
    })
    if (!role) throw new NotFound('Role not found')

    return role
  },

  update: async (id: string, payload: TUpdateRoleBody): TResFindRole => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await roleRepository.findBy({
        field: 'id',
        value: id
      }, trx)
      if (!role) throw new NotFound('Role not found')

      await roleRepository.updateBy(
        {
          field: 'id',
          value: id
        },
        {
          code: payload.code,
          name: payload.name
        },
        trx
      )

      return await roleRepository.findBy({
        field: 'id',
        value: id
      }, trx)
    })
  },

  activation: async (id: string, payload: TActivationRoleBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await roleRepository.findBy({
        field: 'id',
        value: id
      }, trx)
      if (!role) throw new NotFound('Role not found')

      await roleRepository.updateBy(
        {
          field: 'id',
          value: id
        },
        {
          isActive: payload.isActive
        },
        trx
      )

      return await roleRepository.findBy({
        field: 'id',
        value: id
      }, trx)
    })
  },

  delete: async (id: string): TResFindRole => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await roleRepository.findBy({
        field: 'id',
        value: id
      })
      if (!role) throw new NotFound('Role not found')

      const users = await userRepository.getBy({
        field: 'roleId',
        value: role.id
      }, trx)
      if (users.length > 0) throw new BadRequest(`Role already in used, can not delete role ${role.name}`)

      await roleRepository.deleteBy({
        field: 'id',
        value: role.id
      }, trx)

      return role
    })
  },

  permanentDelete: async (id: string): TResFindRole => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await roleRepository.findBy({
        field: 'id',
        value: id
      })
      if (!role) throw new NotFound('Role not found')

      const users = await userRepository.getBy({
        field: 'roleId',
        value: role.id
      }, trx)
      if (users.length > 0) throw new BadRequest(`Role already in used, can not delete role ${role.name}`)

      await roleRepository.deleteBy({
        field: 'id',
        value: role.id,
        permanentDelete: true
      }, trx)

      return role
    })
  },
}