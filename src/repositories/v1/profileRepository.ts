import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { Profile } from '~/entities/profileEntity'

import { TParsedParams, EStatusDelete } from '~/helpers/paramHelper'
import { paginate, TResGetListPaginate } from '~/helpers/paginationHelper'
import { entityMapper } from '~/helpers/entityMapperHelper'
import entity, {
  TDynamicFieldValue,
  TDynamicFieldValueWithRelation,
  TDynamicFieldValueWithDeleted,
  TDynamicQueryOptions,
  TDynamicFieldValueWithOrderBy,
  TDynamicQueryOptionsGet,
  TDynamicFieldValueDeleteOption,
  TDynamicQueryDeleteOptions
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
  const { where, withRelation, withDeleted } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.condition(query, where)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<Profile[]> => {
  const { where, withRelation, withDeleted, withOrderBy } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)

  return query.getMany()
}

const findBy = async <K extends TProfileField>(
  params: TDynamicFieldValueWithRelation<Profile, K> &
    TDynamicFieldValueWithDeleted<Profile, K>,
  trx?: EntityManager,
): TResFindProfile => {
  const {
    field,
    value,
    withRelation,
    withDeleted,
  } = params

  const query = repo(trx).createQueryBuilder('profile')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)

  query.where(`profile.${field} = :value`, { value })

  const data = await query.getOne()

  return entityMapper(data, { withDeleted })
}

const getBy = async<K extends TProfileField>(
  params: TDynamicFieldValueWithRelation<Profile, K> &
    TDynamicFieldValueWithDeleted<Profile, K> &
    TDynamicFieldValueWithOrderBy<Profile, K>,
  trx?: EntityManager
): TResGetProfile => {
  const {
    field,
    value,
    withRelation,
    withDeleted,
    withOrderBy
  } = params
  const query = repo(trx)
    .createQueryBuilder('profile')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)

  query.where(`profile.${field} = :value`, { value })

  const data = await query.getMany()

  return entityMapper(data, { withDeleted })
}

const findByExceptBy = async <
  K extends TProfileField,
  E extends TProfileField
>(
  findParams: TDynamicFieldValueWithRelation<Profile, K> &
    TDynamicFieldValueWithDeleted<Profile, K>,
  exceptParams: TDynamicFieldValue<Profile, E>,
  trx?: EntityManager
): TResFindProfile => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withRelation = findParams.withRelation
  const withDeleted = findParams.withDeleted
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('profile')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)

  query.where(`profile.${findColumn} = :findValue AND profile.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return entityMapper(data, { withDeleted })
}

const getByExceptBy = async <
  K extends TProfileField,
  E extends TProfileField
>(
  findParams: TDynamicFieldValueWithRelation<Profile, K> &
    TDynamicFieldValueWithDeleted<Profile, K> &
    TDynamicFieldValueWithOrderBy<Profile, K>,
  exceptParams: TDynamicFieldValue<Profile, E>,
  trx?: EntityManager
): TResGetProfile => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withRelation = findParams.withRelation
  const withDeleted = findParams.withDeleted
  const withOrderBy = findParams.withOrderBy
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('profile')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'profile.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)

  query.where(`profile.${findColumn} = :findValue AND profile.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return entityMapper(data, { withDeleted })
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