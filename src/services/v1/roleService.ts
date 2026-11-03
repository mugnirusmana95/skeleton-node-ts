import { AppDataSource } from "~/configs/dataSource"
import { BadRequest, NotFound } from "~/helpers/exceptionHelper"
import { parseParams } from "~/helpers/paramHelper"
import repository, { TResGetListPaginate } from "~/repositories"
import { Role } from "~/entities/roleEntity"
import { User } from "~/entities/userEntity"
import {
  TCreateRoleBody,
  TUpdateRoleBody,
  TActivationRoleBody
} from "~/validations/v1/roleValidation"
import { EFilterPagination } from "~/helpers/paginationHelper"

export default {
  getList: async (req: Req): TResGetListPaginate<Role> => {
    const params = parseParams(req)
    return await repository.getListPaginate(Role, params, EFilterPagination.ROLE)
  },

  create: async (payload: TCreateRoleBody): Promise<Role | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const data = await repository.create(Role, {
        ...payload,
        isActive: true
      }, trx)

      return await repository.findBy(Role, {
        field: 'id',
        value: data.id
      }, trx)
    })
  },

  getDetail: async (id: string): Promise<Role | null> => {
    const role = await repository.findBy(Role, {
      field: 'id',
      value: id
    })
    if (!role) throw new NotFound('Role not found')

    return role
  },

  update: async (id: string, payload: TUpdateRoleBody): Promise<Role | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await repository.findBy(Role, {
        field: 'id',
        value: id
      }, trx)
      if (!role) throw new NotFound('Role not found')

      await repository.updateBy(
        Role,
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

      return await repository.findBy(Role, {
        field: 'id',
        value: id
      }, trx)
    })
  },

  activation: async (id: string, payload: TActivationRoleBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await repository.findBy(Role, {
        field: 'id',
        value: id
      }, trx)
      if (!role) throw new NotFound('Role not found')

      await repository.updateBy(
        Role,
        {
          field: 'id',
          value: id
        },
        {
          isActive: payload.isActive
        },
        trx
      )

      return await repository.findBy(Role, {
        field: 'id',
        value: id
      }, trx)
    })
  },

  delete: async (id: string): Promise<Role | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await repository.findBy(Role, {
        field: 'id',
        value: id
      })
      if (!role) throw new NotFound('Role not found')

      const users = await repository.getBy(User, {
        field: 'roleId',
        value: role.id
      }, trx)
      if (users.length > 0) throw new BadRequest(`Role already in used, can not delete role ${role.name}`)

      await repository.deleteBy(Role, {
        field: 'id',
        value: role.id
      }, trx)

      return role
    })
  },

  permanentDelete: async (id: string): Promise<Role | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const role = await repository.findBy(Role, {
        field: 'id',
        value: id
      })
      if (!role) throw new NotFound('Role not found')

      const users = await repository.getBy(User, {
        field: 'roleId',
        value: role.id
      }, trx)
      if (users.length > 0) throw new BadRequest(`Role already in used, can not delete role ${role.name}`)

      await repository.deleteBy(Role, {
        field: 'id',
        value: role.id,
        permanentDelete: true
      }, trx)

      return role
    })
  },
}