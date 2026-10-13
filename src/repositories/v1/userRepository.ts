import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult, SelectQueryBuilder } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { User } from '~/entities/userEntity'

import { TParsedParams, EStatusDelete } from '~/helpers/paramHelper'
import { paginate, TResGetListPaginate } from '~/helpers/paginationHelper'
import { entityMapper } from '~/helpers/entityMapperHelper'

type TCreateUser = Pick<
  User,
  'email' | 'password' | 'roleId' | 'status'
>
type TUpdateUser = Partial<TCreateUser>
type TUserField = Exclude<
  keyof User,
  'users' | 'isDeleted' | 'computeIsDeleted'
>
type TDynamicFieldValue<K extends TUserField> = {
  field: K
  value: User[K]
}
type TDynamicFieldValueWithRole<K extends TUserField> =
  TDynamicFieldValue<K> & {
    withRole?: boolean
  }
type TDynamicFieldValueWithDeleted<K extends TUserField> =
  TDynamicFieldValue<K> & {
    withDeleted?: boolean
  }

export type TResGetListPaginateUser = TResGetListPaginate<User>
export type TResFindUser = Promise<User | null>
export type TResGetUser = Promise<User[]>
export type TResCreateUser = Promise<User>
export type TResUpdateUser = Promise<UpdateResult>
export type TResSoftDeleteUser = TResUpdateUser
export type TResDeleteUser = Promise<DeleteResult>

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(User)

const withRoleData = (
  query: SelectQueryBuilder<User>,
  options?: { withRole?: boolean, withDeleted?: boolean }
) => {
  const withRole = options?.withRole ?? false
  const withDeleted = options?.withDeleted ?? false

  if (withRole) {
    query.leftJoinAndSelect('user.role', 'role')
    if (withDeleted) {
      query.addSelect('role.deletedAt')
    }
  }

  return query
}

const withDeletedData = (
  query: SelectQueryBuilder<User>,
  withDeleted?: boolean
) => {
  if (withDeleted) {
    query.addSelect('user.deletedAt')
  }

  return query
}

const getListPaginate = async (
  params: TParsedParams,
  trx?: EntityManager
): TResGetListPaginateUser => {
  const {
    page = 1,
    limit = 10,
    search = '',
    roleId = null,
    orderBy = [],
    statusDelete
  } = params

  const query = repo(trx)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')

  if (statusDelete === EStatusDelete.WITH) {
    query
      .withDeleted()
      .addSelect('user.deletedAt')
      .addSelect('role.deletedAt')
  } else if (statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('user.deletedAt')
      .addSelect('role.deletedAt')
      .andWhere('user.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`user.email ILIKE :search`, { search })
  }

  if (roleId) {
    query.andWhere(`role.id = :roleId`, { roleId })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        name: 'user.email',
        roleName: 'role.name',
        createdAt: 'user.createdAt',
        updatedAt: 'user.updatedAt',
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
    query.addOrderBy('user.updatedAt', 'DESC')
  }

  return paginate(query, { page, limit, statusDelete })
}

const findBy = async <K extends TUserField>(
  params: TDynamicFieldValueWithRole<K> &
    TDynamicFieldValueWithDeleted<K>,
  trx?: EntityManager,
): TResFindUser => {
  const {
    field,
    value,
    withRole,
    withDeleted
  } = params

  const query = repo(trx)
    .createQueryBuilder('user')

  withRoleData(query, { withRole, withDeleted })
  withDeletedData(query, withDeleted)

  const user = await query
    .where(`user.${field} = :value`, { value })
    .getOne()

  return entityMapper(user, { withDeleted })
}

const getBy = async<K extends TUserField>(
  params: TDynamicFieldValueWithRole<K> &
    TDynamicFieldValueWithDeleted<K>,
  trx?: EntityManager
): TResGetUser => {
  const {
    field,
    value,
    withRole,
    withDeleted
  } = params
  const query = repo(trx)
    .createQueryBuilder('user')

  withRoleData(query, { withRole, withDeleted })
  withDeletedData(query, withDeleted)

  const users = await query
    .where(`user.${field} = :value`, { value })
    .getMany()

  return entityMapper(users, { withDeleted })
}

const findByExceptBy = async <
  K extends TUserField,
  E extends TUserField
>(
  findParams: TDynamicFieldValueWithRole<K> &
    TDynamicFieldValueWithDeleted<K>,
  exceptParams: TDynamicFieldValue<E>,
  trx?: EntityManager
): TResFindUser => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withRole = findParams.withRole
  const withDeleted = findParams.withDeleted
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('user')

  withRoleData(query, { withRole, withDeleted })
  withDeletedData(query, withDeleted)

  const user = await query
    .where(`user.${findColumn} = :findValue AND user.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })
    .getOne()

  return entityMapper(user, { withDeleted })
}

const getByExceptBy = async <
  K extends TUserField,
  E extends TUserField
>(
  findParams: TDynamicFieldValueWithRole<K> &
    TDynamicFieldValueWithDeleted<K>,
  exceptParams: TDynamicFieldValue<E>,
  trx?: EntityManager
): TResGetUser => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withRole = findParams.withRole
  const withDeleted = findParams.withDeleted
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('user')

  withRoleData(query, { withRole, withDeleted })
  withDeletedData(query, withDeleted)

  const users = await query
    .where(`user.${findColumn} = :findValue AND user.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })
    .getMany()

  return entityMapper(users, { withDeleted })
}

const create = async (
  data: TCreateUser,
  trx?: EntityManager
): TResCreateUser => {
  if (Object.keys(data).length === 0) {
    throw new Error('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const updateBy = async <
  K extends TUserField
>(
  params: TDynamicFieldValue<K>,
  data: TUpdateUser,
  trx?: EntityManager,
): TResUpdateUser => {
  if (Object.keys(data).length === 0) {
    throw new Error('Data cannot be empty')
  }

  const { field, value } = params
  return repo(trx).update(
    { [field]: value } as FindOptionsWhere<User>,
    data,
  )
}

const deleteBy = async <K extends TUserField>(
  params: TDynamicFieldValue<K>,
  trx?: EntityManager,
): TResSoftDeleteUser => {
  const { field, value } = params
  return repo(trx).softDelete({
    [field]: value,
  })
}

const permanentDeleteBy = async <K extends TUserField>(
  params: TDynamicFieldValue<K>,
  trx?: EntityManager,
): TResDeleteUser => {
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