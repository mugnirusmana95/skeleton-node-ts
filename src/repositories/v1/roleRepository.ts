import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult, SelectQueryBuilder } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { Role } from '~/entities/roleEntity'

import { TParsedParams, EStatusDelete } from '~/helpers/paramHelper'
import { paginate, TResGetListPaginate } from '~/helpers/paginationHelper'
import { entityMapper } from '~/helpers/entityMapperHelper'

type TCreateRole = Partial<
  Pick<Role, 'code' | 'name' | 'isActive'>
>
type TUpdateRole = Partial<TCreateRole>
type TRoleField = Exclude<
  keyof Role,
  'users' | 'isDeleted' | 'computeIsDeleted'
>
type TDynamicFieldValue<K extends TRoleField> = {
  field: K
  value: Role[K]
}
type TDynamicFieldValueWithUsers<K extends TRoleField> =
  TDynamicFieldValue<K> & {
    withUsers?: boolean
  }
type TDynamicFieldValueWithDeleted<K extends TRoleField> =
  TDynamicFieldValue<K> & {
    withDeleted?: boolean
  }

export type TResGetListPaginateRole = TResGetListPaginate<Role>
export type TResFindRole = Promise<Role | null>
export type TResGetRole = Promise<Role[]>
export type TResCreateRole = Promise<Role>
export type TResUpdateRole = Promise<UpdateResult>
export type TResSoftDeleteRole = TResUpdateRole
export type TResDeleteRole = Promise<DeleteResult>

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(Role)

const withUsersData = (
  query: SelectQueryBuilder<Role>,
  options?: { withUsers?: boolean, withDeleted?: boolean }
) => {
  const withUsers = options?.withUsers ?? false
  const withDeleted = options?.withDeleted ?? false

  if (withUsers) {
    query.leftJoinAndSelect('role.users', 'users')
    if (withDeleted) {
      query.addSelect('users.deletedAt')
    }
  }

  return query
}

const withDeletedData = (
  query: SelectQueryBuilder<Role>,
  withDeleted?: boolean
) => {
  if (withDeleted) {
    query.addSelect('role.deletedAt')
  }

  return query
}

const getListPaginate = async (
  params: TParsedParams,
  trx?: EntityManager
): TResGetListPaginateRole => {
  const {
    page = 1,
    limit = 10,
    search = '',
    orderBy = [],
    statusDelete,
    withUsers
  } = params

  const query = repo(trx)
    .createQueryBuilder('role')

  if (withUsers) {
    query.leftJoinAndSelect('role.users', 'users')
  }

  if (statusDelete === EStatusDelete.WITH) {
    query
      .withDeleted()
      .addSelect('role.deletedAt')

    if (withUsers) {
      query.addSelect('users.deletedAt')
    }
  } else if (statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('role.deletedAt')
      .andWhere('role.deletedAt IS NOT NULL')

    if (withUsers) {
      query.addSelect('users.deletedAt')
    }
  }

  if (search) {
    query.andWhere(`(role.code ILIKE :search OR role.name ILIKE :search)`, { search: `%${search}%` })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        code: 'role.code',
        name: 'role.name',
        createdAt: 'role.createdAt',
        updatedAt: 'role.updatedAt',
      }

      const column = columnMap[item.column]

      if (column) {
        query.addOrderBy(
          column,
          item.direction.toUpperCase() as 'ASC' | 'DESC',
        )
      }
    }
  } else {
    query.addOrderBy('role.updatedAt', 'DESC')
  }

  return paginate(query, { page, limit, statusDelete })
}

const findBy = async <K extends TRoleField>(
  params: TDynamicFieldValueWithUsers<K> &
    TDynamicFieldValueWithDeleted<K>,
  trx?: EntityManager,
): TResFindRole => {
  const { field, value, withUsers, withDeleted } = params

  const query = repo(trx).createQueryBuilder('role')

  withUsersData(query, { withUsers, withDeleted })
  withDeletedData(query, withDeleted)

  const role = await query.where(`role.${field} = :value`, { value })
    .getOne()

  return entityMapper(role, { withDeleted })
}

const getBy = async <K extends TRoleField>(
  params: TDynamicFieldValueWithUsers<K> &
    TDynamicFieldValueWithDeleted<K>,
  trx?: EntityManager
): TResGetRole => {
  const { field, value, withUsers, withDeleted } = params
  const query = repo(trx)
    .createQueryBuilder('role')

  withUsersData(query, { withUsers, withDeleted })
  withDeletedData(query, withDeleted)

  const roles = await query
    .where(`role.${field} = :value`, { value })
    .getMany()

  return entityMapper(roles, { withDeleted })
}

const findByExceptBy = async <
  K extends TRoleField,
  E extends TRoleField
>(
  findParams: TDynamicFieldValueWithUsers<K> &
    TDynamicFieldValueWithDeleted<K>,
  exceptParams: TDynamicFieldValue<E>,
  trx?: EntityManager
): TResFindRole => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withUsers = findParams.withUsers
  const withDeleted = findParams.withDeleted
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('role')

  withUsersData(query, { withUsers, withDeleted })
  withDeletedData(query, withDeleted)

  const role = await query
    .where(`role.${findColumn} = :findValue AND role.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })
    .getOne()

  return entityMapper(role, { withDeleted })
}

const getByExceptBy = async <
  K extends TRoleField,
  E extends TRoleField
>(
  findParams: TDynamicFieldValueWithUsers<K> &
    TDynamicFieldValueWithDeleted<K>,
  exceptParams: TDynamicFieldValue<E>,
  trx?: EntityManager
): TResGetRole => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withUsers = findParams.withUsers
  const withDeleted = findParams.withDeleted
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('role')

  withUsersData(query, { withUsers, withDeleted })
  withDeletedData(query, withDeleted)

  const roles = await query
    .where(`role.${findColumn} = :findValue AND role.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })
    .getMany()

  return entityMapper(roles, { withDeleted })
}

const create = async (
  data: TCreateRole,
  trx?: EntityManager
): TResCreateRole => {
  if (Object.keys(data).length === 0) {
    throw new Error('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const updateBy = async <
  K extends TRoleField
>(
  params: TDynamicFieldValue<K>,
  data: TUpdateRole,
  trx?: EntityManager,
): TResUpdateRole => {
  if (Object.keys(data).length === 0) {
    throw new Error('Data cannot be empty')
  }

  const { field, value } = params
  return repo(trx).update(
    { [field]: value } as FindOptionsWhere<Role>,
    data,
  )
}

const deleteBy = async <K extends TRoleField>(
  params: TDynamicFieldValue<K>,
  trx?: EntityManager,
): TResSoftDeleteRole => {
  const { field, value } = params
  return repo(trx).softDelete({
    [field]: value,
  })
}

const permanentDeleteBy = async <K extends TRoleField>(
  params: TDynamicFieldValue<K>,
  trx?: EntityManager,
): TResDeleteRole => {
  const { field, value } = params
  return repo(trx).delete({
    [field]: value,
  })
}

export default {
  getListPaginate,
  findBy,
  getBy,
  findByExceptBy,
  getByExceptBy,
  create,
  updateBy,
  deleteBy,
  permanentDeleteBy,
}