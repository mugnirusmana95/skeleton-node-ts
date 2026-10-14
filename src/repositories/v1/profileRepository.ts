import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { Profile } from '~/entities/profileEntity'

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
  TDynamicFieldValueWithGroupBy
} from '~/helpers/entityHelper'

type TCreateProfile = Pick<
  Profile,
  'firstName'
  | 'middleName'
  | 'lastName'
  | 'phoneCode'
  | 'phoneNumber'
  | 'address'
  | 'userId'
>
type TUpdateProfile = Partial<TCreateProfile>
type TProfileField = Exclude<
  keyof Profile,
  'fullName'
  | 'fullPhone'
  | 'isDeleted'
  | 'computeIsDeleted'
>

export type TResGetListPaginateProfile = TResGetListPaginate<Profile>
export type TResFindProfile = Promise<Profile | null>
export type TResGetProfile = Promise<Profile[]>
export type TResCreateProfile = Promise<Profile>
export type TResUpdateProfile = Promise<UpdateResult>
export type TResSoftDeleteProfile = TResUpdateProfile
export type TResDeleteProfile = DeleteResult

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(Profile)

const getListPaginate = async (
  params: TParsedParams,
  trx?: EntityManager
): TResGetListPaginateProfile => {
  const {
    page = 1,
    limit = 10,
    search = '',
    userId = null,
    orderBy = [],
    statusDelete
  } = params

  const query = repo(trx)
    .createQueryBuilder('profile')
    .leftJoinAndSelect('profile.user', 'user')

  if (statusDelete === EStatusDelete.WITH) {
    query
      .withDeleted()
      .addSelect('profile.deletedAt')
      .addSelect('profile.deletedAt')
  } else if (statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('profile.deletedAt')
      .addSelect('user.deletedAt')
      .andWhere('profile.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`profile.email ILIKE :search`, { search })
  }

  if (userId) {
    query.andWhere(`user.id = :userId`, { userId })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        firstName: 'profile.firstName',
        middleName: 'profile.middleName',
        lastName: 'profile.lastName',
        phoneCode: 'profile.phoneCode',
        phoneNumber: 'profile.phoneNumber',
        userEmail: 'user.email',
        createdAt: 'profile.createdAt',
        updatedAt: 'profile.updatedAt',
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
    query.addOrderBy('profile.updatedAt', 'DESC')
  }

  return paginate(query, { page, limit, statusDelete })
}

const find = async (
  params: TDynamicQueryOptions,
  trx?: EntityManager,
): Promise<Profile | null> => {
  const { where, withSelect, withRelation, withDeleted, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.groupBy(query, withGroupBy)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<Profile[]> => {
  const { where, withSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  return query.getMany()
}

const findBy = async <K extends TProfileField>(
  params: TDynamicFieldValueWithSelect<Profile, K> &
    TDynamicFieldValueWithRelation<Profile, K> &
    TDynamicFieldValueWithDeleted<Profile, K> &
    TDynamicFieldValueWithGroupBy<Profile, K>,
  trx?: EntityManager,
): TResFindProfile => {
  const {
    field,
    value,
    withSelect,
    withRelation,
    withDeleted,
    withGroupBy,
  } = params

  const query = repo(trx).createQueryBuilder('profile')

  entity.select(query, withSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`profile.${field} = :value`, { value })

  const data = await query.getOne()

  return data
}

const getBy = async<K extends TProfileField>(
  params: TDynamicFieldValueWithSelect<Profile, K> &
    TDynamicFieldValueWithRelation<Profile, K> &
    TDynamicFieldValueWithDeleted<Profile, K> &
    TDynamicFieldValueWithOrderBy<Profile, K> &
    TDynamicFieldValueWithGroupBy<Profile, K>,
  trx?: EntityManager
): TResGetProfile => {
  const {
    field,
    value,
    withSelect,
    withRelation,
    withDeleted,
    withOrderBy,
    withGroupBy
  } = params
  const query = repo(trx)
    .createQueryBuilder('profile')

  entity.select(query, withSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`profile.${field} = :value`, { value })

  const data = await query.getMany()

  return data
}

const findByExceptBy = async <
  K extends TProfileField,
  E extends TProfileField
>(
  findParams: TDynamicFieldValueWithSelect<Profile, K> &
    TDynamicFieldValueWithRelation<Profile, K> &
    TDynamicFieldValueWithDeleted<Profile, K> &
    TDynamicFieldValueWithGroupBy<Profile, K>,
  exceptParams: TDynamicFieldValue<Profile, E>,
  trx?: EntityManager
): TResFindProfile => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withSelect = findParams.withSelect
  const withRelation = findParams.withRelation
  const withDeleted = findParams.withDeleted
  const withGroupBy = findParams.withGroupBy
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('profile')

  entity.select(query, withSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`profile.${findColumn} = :findValue AND profile.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return data
}

const getByExceptBy = async <
  K extends TProfileField,
  E extends TProfileField
>(
  findParams: TDynamicFieldValueWithSelect<Profile, K> &
    TDynamicFieldValueWithRelation<Profile, K> &
    TDynamicFieldValueWithDeleted<Profile, K> &
    TDynamicFieldValueWithOrderBy<Profile, K> &
    TDynamicFieldValueWithGroupBy<Profile, K>,
  exceptParams: TDynamicFieldValue<Profile, E>,
  trx?: EntityManager
): TResGetProfile => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withSelect = findParams.withSelect
  const withRelation = findParams.withRelation
  const withDeleted = findParams.withDeleted
  const withOrderBy = findParams.withOrderBy
  const withGroupBy = findParams.withGroupBy
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('profile')

  entity.select(query, withSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`profile.${findColumn} = :findValue AND profile.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return data
}

const create = async (
  data: TCreateProfile,
  trx?: EntityManager
): TResCreateProfile => {
  if (Object.keys(data).length === 0) {
    throw new Error('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const update = async (
  params: TDynamicQueryOptions,
  data: TUpdateProfile,
  trx?: EntityManager,
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new Error('Data cannot be empty')
  }

  const query = repo(trx).createQueryBuilder('profile')
    .select('profile.id')

  const { where, withRelation, withDeleted } = params

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.condition(query, where)

  const result = await query.getMany()

  const ids = result.map((item) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  return repo(trx).update(ids, data)
}

const updateBy = async <
  K extends TProfileField
>(
  params: TDynamicFieldValue<Profile, K>,
  data: TUpdateProfile,
  trx?: EntityManager,
): TResUpdateProfile => {
  if (Object.keys(data).length === 0) {
    throw new Error('Data cannot be empty')
  }

  const { field, value } = params
  return repo(trx).update(
    { [field]: value } as FindOptionsWhere<Profile>,
    data,
  )
}

const deleted = async (
  params: TDynamicQueryDeleteOptions,
  trx?: EntityManager,
): Promise<TResSoftDeleteProfile | TResDeleteProfile> => {
  const query = repo(trx).createQueryBuilder('profile')

  const { where, withRelation, withDeleted, permanentDelete } = params

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
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

const deleteBy = async <K extends TProfileField>(
  params: TDynamicFieldValueDeleteOption<Profile, K>,
  trx?: EntityManager,
): Promise<TResSoftDeleteProfile | TResDeleteProfile> => {
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