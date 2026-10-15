import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { UserToken } from '~/entities/userTokenEntity'

import { InternalServer } from '~/exceptions'

import { TParsedParams, EStatusDelete } from '~/helpers/paramHelper'
import { paginate, TResGetListPaginate } from '~/helpers/paginationHelper'
import entity, {
  TDynamicFieldValue,
  TDynamicFieldValueWithSelect,
  TDynamicFieldValueWithRelation,
  TDynamicFieldValueWithDeleted,
  TDynamicQueryOptions,
  TDynamicFieldValueWithOrderBy,
  TDynamicQueryOptionsGet,
  TDynamicFieldValueDeleteOption,
  TDynamicQueryDeleteOptions,
  TDynamicFieldValueWithGroupBy,
  TDynamicFieldValueWithAddSelect
} from '~/helpers/entityHelper'

type TCreateUserToken = Pick<
  UserToken,
  'type'
  | 'userId'
  | 'isActive'
  | 'token'
  | 'expiredAt'
>
type TUpdateUserToken = Partial<TCreateUserToken>
type TUserTokenField = Exclude<
  keyof UserToken,
  'typeText'
  | 'isDeleted'
  | 'computeIsDeleted'
>

export type TResGetListPaginateUserToken = TResGetListPaginate<UserToken>
export type TResFindUserToken = Promise<UserToken | null>
export type TResGetUserToken = Promise<UserToken[]>
export type TResCreateUserToken = Promise<UserToken>
export type TResUpdateUserToken = Promise<UpdateResult>
export type TResSoftDeleteUserToken = TResUpdateUserToken
export type TResDeleteUserToken = DeleteResult

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(UserToken)

const getListPaginate = async (
  params: TParsedParams,
  trx?: EntityManager
): TResGetListPaginateUserToken => {
  const {
    page = 1,
    limit = 10,
    search = '',
    userId = null,
    orderBy = [],
    statusDelete
  } = params

  const query = repo(trx)
    .createQueryBuilder('userToken')
    .leftJoinAndSelect('userToken.user', 'user')

  if (statusDelete === EStatusDelete.WITH) {
    query
      .withDeleted()
      .addSelect('userToken.deletedAt')
      .addSelect('userToken.deletedAt')
  } else if (statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('userToken.deletedAt')
      .addSelect('user.deletedAt')
      .andWhere('userToken.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`userToken.email ILIKE :search`, { search })
  }

  if (userId) {
    query.andWhere(`userId = :userId`, { userId })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        firstName: 'userToken.firstName',
        middleName: 'userToken.middleName',
        lastName: 'userToken.lastName',
        phoneCode: 'userToken.phoneCode',
        phoneNumber: 'userToken.phoneNumber',
        userEmail: 'user.email',
        createdAt: 'userToken.createdAt',
        updatedAt: 'userToken.updatedAt',
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
    query.addOrderBy('userToken.updatedAt', 'DESC')
  }

  return paginate(query, { page, limit, statusDelete })
}

const find = async (
  params: TDynamicQueryOptions,
  trx?: EntityManager,
): Promise<UserToken | null> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'userToken.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.groupBy(query, withGroupBy)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<UserToken[]> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'userToken.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  return query.getMany()
}

const findBy = async <K extends TUserTokenField>(
  params: TDynamicFieldValueWithSelect<UserToken, K> &
    TDynamicFieldValueWithAddSelect<UserToken, K> &
    TDynamicFieldValueWithRelation<UserToken, K> &
    TDynamicFieldValueWithDeleted<UserToken, K> &
    TDynamicFieldValueWithGroupBy<UserToken, K>,
  trx?: EntityManager,
): TResFindUserToken => {
  const {
    field,
    value,
    withSelect,
    withAddSelect,
    withRelation,
    withDeleted,
    withGroupBy,
  } = params

  const query = repo(trx).createQueryBuilder('userToken')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'userToken.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`userToken.${field} = :value`, { value })

  const data = await query.getOne()

  return data
}

const getBy = async<K extends TUserTokenField>(
  params: TDynamicFieldValueWithSelect<UserToken, K> &
    TDynamicFieldValueWithAddSelect<UserToken, K> &
    TDynamicFieldValueWithRelation<UserToken, K> &
    TDynamicFieldValueWithDeleted<UserToken, K> &
    TDynamicFieldValueWithOrderBy<UserToken, K> &
    TDynamicFieldValueWithGroupBy<UserToken, K>,
  trx?: EntityManager
): TResGetUserToken => {
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
    .createQueryBuilder('userToken')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'userToken.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`userToken.${field} = :value`, { value })

  const data = await query.getMany()

  return data
}

const findByExceptBy = async <
  K extends TUserTokenField,
  E extends TUserTokenField
>(
  findParams: TDynamicFieldValueWithSelect<UserToken, K> &
    TDynamicFieldValueWithAddSelect<UserToken, K> &
    TDynamicFieldValueWithRelation<UserToken, K> &
    TDynamicFieldValueWithDeleted<UserToken, K> &
    TDynamicFieldValueWithGroupBy<UserToken, K>,
  exceptParams: TDynamicFieldValue<UserToken, E>,
  trx?: EntityManager
): TResFindUserToken => {
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
    .createQueryBuilder('userToken')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'userToken.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`userToken.${findColumn} = :findValue AND userToken.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return data
}

const getByExceptBy = async <
  K extends TUserTokenField,
  E extends TUserTokenField
>(
  findParams: TDynamicFieldValueWithSelect<UserToken, K> &
    TDynamicFieldValueWithAddSelect<UserToken, K> &
    TDynamicFieldValueWithRelation<UserToken, K> &
    TDynamicFieldValueWithDeleted<UserToken, K> &
    TDynamicFieldValueWithOrderBy<UserToken, K> &
    TDynamicFieldValueWithGroupBy<UserToken, K>,
  exceptParams: TDynamicFieldValue<UserToken, E>,
  trx?: EntityManager
): TResGetUserToken => {
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
    .createQueryBuilder('userToken')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'userToken.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`userToken.${findColumn} = :findValue AND userToken.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return data
}

const create = async (
  data: TCreateUserToken,
  trx?: EntityManager
): TResCreateUserToken => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const update = async (
  params: TDynamicQueryOptions,
  data: TUpdateUserToken,
  trx?: EntityManager,
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = repo(trx).createQueryBuilder('userToken')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'userToken.deletedAt', withDeleted)
  entity.condition(query, where)

  const result = await query.getMany()

  const ids = result.map((item) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  return repo(trx).update(ids, data)
}

const updateBy = async <
  K extends TUserTokenField
>(
  params: TDynamicFieldValue<UserToken, K>,
  data: TUpdateUserToken,
  trx?: EntityManager,
): TResUpdateUserToken => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  const { field, value } = params
  return repo(trx).update(
    { [field]: value } as FindOptionsWhere<UserToken>,
    data,
  )
}

const deleted = async (
  params: TDynamicQueryDeleteOptions,
  trx?: EntityManager,
): Promise<TResSoftDeleteUserToken | TResDeleteUserToken> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, permanentDelete } = params

  const query = repo(trx).createQueryBuilder('userToken')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'userToken.deletedAt', withDeleted)
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

const deleteBy = async <K extends TUserTokenField>(
  params: TDynamicFieldValueDeleteOption<UserToken, K>,
  trx?: EntityManager,
): Promise<TResSoftDeleteUserToken | TResDeleteUserToken> => {
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
  update,
  updateBy,
  deleted,
  deleteBy,
}