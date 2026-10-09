import { Request } from "express"
import { AppDataSource } from "~/configs/dataSource"

import { parseParams } from "~/helpers/paramHelper"

import roleRepository from "~/repositories/v1/roleRepository"

import { TCreateRoleBody } from "~/validations/v1/roleValidation"

export default {
  getList: async (req: Request) => {
    const params = parseParams(req)
    return await roleRepository.getListPaginate(params)
  },

  create: async (payload: TCreateRoleBody) => {
    return await AppDataSource.transaction(async (trx) => {
      return await roleRepository.create({
        ...payload,
        isActive: true
      }, trx)
    })
  },

  getDetail: async (id: string) => {
    return await roleRepository.findById(id)
  },

  delete: async (id: string) => {
    return await AppDataSource.transaction(async (trx) => {
      return await roleRepository.deleteById(id, trx)
    })
  }
}