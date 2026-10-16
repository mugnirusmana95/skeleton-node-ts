import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { User } from '~/entities/userEntity'

import { InternalServer } from '~/helpers/exceptionHelper'

import { TParsedParams, EStatusDelete } from '~/helpers/paramHelper'
import { paginate, TResGetListPaginate } from '~/helpers/paginationHelper'

import entity, {
  TDynamicFieldValue,
  TDynamicFieldValueWithSelect,
  TDynamicFieldValueWithRelation,
  TDynamicFieldValueWithDeleted,
  TDynamicQueryOptions,
  TDynamicQueryDeleteOptions,
  TDynamicFieldValueDeleteOption,
  TDynamicQueryOptionsGet,
  TDynamicFieldValueWithOrderBy,
  TDynamicFieldValueWithGroupBy,
  TDynamicFieldValueWithAddSelect
} from '~/helpers/entityHelper'

type TCreateUser = Pick<
  User,
  'email'
  | 'password'
  | 'roleId'
  | 'status'
>
type TUpdateUser = Partial<TCreateUser>
type TUserField = Exclude<
  keyof User,
  | 'isDeleted'
  | 'computeIsDeleted'
>

export type TResGetListPaginateUser = TResGetListPaginate<User>
export type TResFindUser = Promise<User | null>
export type TResGetUser = Promise<User[]>
export type TResCreateUser = Promise<User>
export type TResUpdateUser = Promise<UpdateResult>
export type TResSoftDeleteUser = TResUpdateUser
export type TResDeleteUser = DeleteResult

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(User)

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

  const query = repo(trx).createQueryBuilder('user')

  query
    .leftJoinAndSelect('user.role', 'role')
    .leftJoinAndSelect('user.profile', 'profile')

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('user.deletedAt')
      .addSelect('role.deletedAt')
      .addSelect('profile.deletedAt')
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere('user.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`(
        user.email ILIKE :search OR
        profile.firstName ILIKE :search OR
        profile.middleName ILIKE :search OR
        profile.lastName ILIKE :search OR
        profile.phoneCode ILIKE :search OR
        profile.phoneNumber ILIKE :search
      )`,
      { search: `%${search}%` })
  }

  if (roleId) {
    query.andWhere(`user.roleId = :roleId`, { roleId })
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

const find = async (
  params: TDynamicQueryOptions,
  trx?: EntityManager,
): Promise<User | null> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('user')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'user.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.groupBy(query, withGroupBy)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<User[]> => {
  const { where, withRelation, withDeleted, withOrderBy, withGroupBy, withSelect, withAddSelect } = params
  const query = repo(trx).createQueryBuilder('user')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'user.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  return query.getMany()
}

const findBy = async <K extends TUserField>(
  params: TDynamicFieldValueWithSelect<User, K> &
    TDynamicFieldValueWithAddSelect<User, K> &
    TDynamicFieldValueWithRelation<User, K> &
    TDynamicFieldValueWithDeleted<User, K> &
    TDynamicFieldValueWithGroupBy<User, K>,
  trx?: EntityManager,
): TResFindUser => {
  const {
    field,
    value,
    withSelect,
    withAddSelect,
    withRelation,
    withDeleted,
    withGroupBy
  } = params

  const query = repo(trx)
    .createQueryBuilder('user')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'user.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`user.${field} = :value`, { value })

  const data = await query.getOne()

  return data
}

const getBy = async<K extends TUserField>(
  params: TDynamicFieldValueWithSelect<User, K> &
    TDynamicFieldValueWithAddSelect<User, K> &
    TDynamicFieldValueWithRelation<User, K> &
    TDynamicFieldValueWithDeleted<User, K> &
    TDynamicFieldValueWithOrderBy<User, K> &
    TDynamicFieldValueWithGroupBy<User, K>,
  trx?: EntityManager
): TResGetUser => {
  const {
    field,
    value,
    withSelect,
    withAddSelect,
    withRelation,
    withDeleted,
    withOrderBy,
    withGroupBy
  } = params
  const query = repo(trx)
    .createQueryBuilder('user')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'user.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`user.${field} = :value`, { value })

  const data = await query.getMany()

  return data
}

const findByExceptBy = async <
  K extends TUserField,
  E extends TUserField
>(
  findParams: TDynamicFieldValueWithSelect<User, K> &
    TDynamicFieldValueWithAddSelect<User, K> &
    TDynamicFieldValueWithRelation<User, K> &
    TDynamicFieldValueWithDeleted<User, K> &
    TDynamicFieldValueWithGroupBy<User, K>,
  exceptParams: TDynamicFieldValue<User, E>,
  trx?: EntityManager
): TResFindUser => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withSelect = findParams.withSelect
  const withAddSelect = findParams.withAddSelect
  const withRelation = findParams.withRelation
  const withDeleted = findParams.withDeleted
  const withGroupBy = findParams.withGroupBy
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('user')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'user.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`user.${findColumn} = :findValue AND user.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return data
}

const getByExceptBy = async <
  K extends TUserField,
  E extends TUserField
>(
  findParams: TDynamicFieldValueWithSelect<User, K> &
    TDynamicFieldValueWithAddSelect<User, K> &
    TDynamicFieldValueWithRelation<User, K> &
    TDynamicFieldValueWithDeleted<User, K> &
    TDynamicFieldValueWithOrderBy<User, K> &
    TDynamicFieldValueWithGroupBy<User, K>,
  exceptParams: TDynamicFieldValue<User, E>,
  trx?: EntityManager
): TResGetUser => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withSelect = findParams.withSelect
  const withAddSelect = findParams.withAddSelect
  const withRelation = findParams.withRelation
  const withDeleted = findParams.withDeleted
  const withOrderBy = findParams.withOrderBy
  const withGroupBy = findParams.withGroupBy
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('user')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'user.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`user.${findColumn} = :findValue AND user.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return data
}

const create = async (
  data: TCreateUser,
  trx?: EntityManager
): TResCreateUser => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const createMany = async (
  data: TCreateUser[],
  trx?: EntityManager
): Promise<User[]> => {
  if (
    data.length === 0 ||
    data.some((item) => Object.keys(item).length === 0)
  ) {
    throw new InternalServer('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const update = async (
  params: TDynamicQueryOptions,
  data: TUpdateUser,
  trx?: EntityManager,
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = repo(trx).createQueryBuilder('user')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'user.deletedAt', withDeleted)
  entity.condition(query, where)

  const result = await query.getMany()

  const ids = result.map((item) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  return repo(trx).update(ids, data)
}

const updateBy = async <
  K extends TUserField
>(
  params: TDynamicFieldValue<User, K>,
  data: TUpdateUser,
  trx?: EntityManager,
): TResUpdateUser => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  const { field, value } = params
  return repo(trx).update(
    { [field]: value } as FindOptionsWhere<User>,
    data,
  )
}

const deleted = async (
  params: TDynamicQueryDeleteOptions,
  trx?: EntityManager,
): Promise<TResSoftDeleteUser | TResDeleteUser> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, permanentDelete } = params

  const query = repo(trx).createQueryBuilder('user')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'user.deletedAt', withDeleted)
  entity.condition(query, where)

  const data = await query.getMany()

  const ids = data.map((item) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  if (permanentDelete) {
    return repo(trx).delete(ids)
  }

  return repo(trx).softDelete(ids)
}

const deleteBy = async <K extends TUserField>(
  params: TDynamicFieldValueDeleteOption<User, K>,
  trx?: EntityManager,
): Promise<TResSoftDeleteUser | TResDeleteUser> => {
  const { field, value, permanentDelete } = params
  if (permanentDelete) {
    return repo(trx).delete({
      [field]: value,
    })
  }
  return repo(trx).softDelete({
    [field]: value,
  })
}

export default {
  getListPaginate,
  find,
  get,
  findBy,
  getBy,
  findByExceptBy,
  getByExceptBy,
  create,
  createMany,
  updateBy,
  update,
  deleted,
  deleteBy
}