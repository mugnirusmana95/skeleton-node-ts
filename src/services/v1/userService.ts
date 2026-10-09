import { AppDataSource } from "~/configs/dataSource"

import { EUserStatusEntity } from '~/entities/userEntity'

import roleRepository from "~/repositories/v1/roleRepository"
import userRepository from "~/repositories/v1/userRepository"

export type TCreateUserService = {
  email: string
  password: string
  roleId: string
  firstName: string
  lastName: string
}

export default {
  create: async (payload: TCreateUserService) => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await roleRepository.findById(payload.roleId, trx)
      if (!role) throw new Error('User Not Found')

      return userRepository.create({
        email: payload.email,
        password: payload.password,
        roleId: role.id,
        status: EUserStatusEntity.INACTIVE,
      }, trx)
    })
  },

  getDetail: async (id: string) => {
    return await userRepository.findById(id)
  },

  delete: async (id: string) => {
    return await AppDataSource.transaction(async (trx) => {
      return await userRepository.deleteById(id, trx)
    })
  }
}