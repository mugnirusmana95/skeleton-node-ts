import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { Role } from '~/entities/roleEntity'

import { TParsedParams, EStatusDelete } from '~/helpers/paramHelper'
import { paginate, TResGetListPaginate } from '~/helpers/paginationHelper'
import { entityMapper } from '~/helpers/entityMapperHelper'

import entity, {
  TDynamicFieldValue,
  TDynamicFieldValueWithRelation,
  TDynamicFieldValueWithDeleted,
  TDynamicQueryOptions,
  TDynamicQueryDeleteOptions,
  TDynamicFieldValueDeleteOption,
  TDynamicQueryOptionsGet,
  TDynamicFieldValueWithOrderBy
} from '~/helpers/entityHelper'

type TCreateRole = Partial<
  Pick<Role, 'code' | 'name' | 'isActive'>
>
type TUpdateRole = Partial<TCreateRole>
type TRoleField = Exclude<
  keyof Role,
  'isDeleted' | 'computeIsDeleted'
>

export type TResGetListPaginateRole = TResGetListPaginate<Role>
export type TResFindRole = Promise<Role | null>
export type TResGetRole = Promise<Role[]>
export type TResCreateRole = Promise<Role>
export type TResUpdateRole = Promise<UpdateResult>
export type TResSoftDeleteRole = TResUpdateRole
export type TResDeleteRole = Promise<DeleteResult>

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(Role)

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
    fullRelation
  } = params

  const query = repo(trx)
    .createQueryBuilder('role')

  if (fullRelation) {
    query.leftJoinAndSelect('role.users', 'users')
    query.leftJoinAndSelect('users.profile', 'profile')
  }

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('role.deletedAt')

    if (fullRelation) {
      query
        .addSelect('users.deletedAt')
        .addSelect('profile.deletedAt')
    }
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere('role.deletedAt IS NOT NULL')
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

const find = async (
  params: TDynamicQueryOptions,
  trx?: EntityManager,
): Promise<Role | null> => {
  const { where, withRelation, withDeleted } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.condition(query, where)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<Role[]> => {
  const { where, withRelation, withDeleted, withOrderBy } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)

  return query.getMany()
}

const findBy = async <K extends TRoleField>(
  params: TDynamicFieldValueWithRelation<Role, K> &
    TDynamicFieldValueWithDeleted<Role, K>,
  trx?: EntityManager,
): TResFindRole => {
  const { field, value, withRelation, withDeleted } = params

  const query = repo(trx).createQueryBuilder('role')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)

  query.where(`role.${field} = :value`, { value })

  const data = await query.getOne()

  return entityMapper(data, { withDeleted })
}

const getBy = async <K extends TRoleField>(
  params: TDynamicFieldValueWithRelation<Role, K> &
    TDynamicFieldValueWithDeleted<Role, K> &
    TDynamicFieldValueWithOrderBy<Role, K>,
  trx?: EntityManager
): TResGetRole => {
  const { field, value, withRelation, withDeleted, withOrderBy } = params
  const query = repo(trx)
    .createQueryBuilder('role')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)

  query.where(`role.${field} = :value`, { value })

  const data = await query.getMany()

  return entityMapper(data, { withDeleted })
}

const findByExceptBy = async <
  K extends TRoleField,
  E extends TRoleField
>(
  findParams: TDynamicFieldValueWithRelation<Role, K> &
    TDynamicFieldValueWithDeleted<Role, K>,
  exceptParams: TDynamicFieldValue<Role, E>,
  trx?: EntityManager
): TResFindRole => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withRelation = findParams.withRelation
  const withDeleted = findParams.withDeleted
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('role')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)

  query.where(`role.${findColumn} = :findValue AND role.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return entityMapper(data, { withDeleted })
}

const getByExceptBy = async <
  K extends TRoleField,
  E extends TRoleField
>(
  findParams: TDynamicFieldValueWithRelation<Role, K> &
    TDynamicFieldValueWithDeleted<Role, K> &
    TDynamicFieldValueWithOrderBy<Role, K>,
  exceptParams: TDynamicFieldValue<Role, E>,
  trx?: EntityManager
): TResGetRole => {
  const findColumn = findParams.field
  const findValue = findParams.value
  const withRelation = findParams.withRelation
  const withDeleted = findParams.withDeleted
  const withOrderBy = findParams.withOrderBy
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = repo(trx)
    .createQueryBuilder('role')

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)

  query.where(`role.${findColumn} = :findValue AND role.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return entityMapper(data, { withDeleted })
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

const update = async (
  params: TDynamicQueryOptions,
  data: TUpdateRole,
  trx?: EntityManager,
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new Error('Data cannot be empty')
  }

  const query = repo(trx).createQueryBuilder('role')
    .select('role.id')

  const { where, withRelation, withDeleted } = params

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.condition(query, where)

  const result = await query.getMany()

  const ids = result.map((item) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  return repo(trx).update(ids, data)
}

const updateBy = async <
  K extends TRoleField
>(
  params: TDynamicFieldValue<Role, K>,
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

const deleted = async (
  params: TDynamicQueryDeleteOptions,
  trx?: EntityManager,
): Promise<TResSoftDeleteRole | TResDeleteRole> => {
  const query = repo(trx).createQueryBuilder('role')

  const { where, withRelation, withDeleted, permanentDelete } = params

  entity.with(query, withRelation, withDeleted)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
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

const deleteBy = async <K extends TRoleField>(
  params: TDynamicFieldValueDeleteOption<Role, K>,
  trx?: EntityManager,
): Promise<TResSoftDeleteRole | TResDeleteRole> => {
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