import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { Role } from '~/entities/roleEntity'

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
export type TResDeleteRole = DeleteResult

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
    statusDelete
  } = params

  const query = repo(trx)
    .createQueryBuilder('role')

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('role.deletedAt')
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
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.groupBy(query, withGroupBy)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<Role[]> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  return query.getMany()
}

const findBy = async <K extends TRoleField>(
  params: TDynamicFieldValueWithSelect<Role, K> &
    TDynamicFieldValueWithAddSelect<Role, K> &
    TDynamicFieldValueWithRelation<Role, K> &
    TDynamicFieldValueWithDeleted<Role, K> &
    TDynamicFieldValueWithGroupBy<Role, K>,
  trx?: EntityManager,
): TResFindRole => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params

  const query = repo(trx).createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`role.${field} = :value`, { value })


  const data = await query.getOne()

  return data
}

const getBy = async <K extends TRoleField>(
  params: TDynamicFieldValueWithSelect<Role, K> &
    TDynamicFieldValueWithAddSelect<Role, K> &
    TDynamicFieldValueWithRelation<Role, K> &
    TDynamicFieldValueWithDeleted<Role, K> &
    TDynamicFieldValueWithOrderBy<Role, K> &
    TDynamicFieldValueWithGroupBy<Role, K>,
  trx?: EntityManager
): TResGetRole => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx)
    .createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`role.${field} = :value`, { value })

  const data = await query.getMany()

  return data
}

const findByExceptBy = async <
  K extends TRoleField,
  E extends TRoleField
>(
  findParams: TDynamicFieldValueWithSelect<Role, K> &
    TDynamicFieldValueWithAddSelect<Role, K> &
    TDynamicFieldValueWithRelation<Role, K> &
    TDynamicFieldValueWithDeleted<Role, K> &
    TDynamicFieldValueWithGroupBy<Role, K>,
  exceptParams: TDynamicFieldValue<Role, E>,
  trx?: EntityManager
): TResFindRole => {
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
    .createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`role.${findColumn} = :findValue AND role.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return data
}

const getByExceptBy = async <
  K extends TRoleField,
  E extends TRoleField
>(
  findParams: TDynamicFieldValueWithSelect<Role, K> &
    TDynamicFieldValueWithAddSelect<Role, K> &
    TDynamicFieldValueWithRelation<Role, K> &
    TDynamicFieldValueWithDeleted<Role, K> &
    TDynamicFieldValueWithOrderBy<Role, K> &
    TDynamicFieldValueWithGroupBy<Role, K>,
  exceptParams: TDynamicFieldValue<Role, E>,
  trx?: EntityManager
): TResGetRole => {
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
    .createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'role.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`role.${findColumn} = :findValue AND role.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return data
}

const create = async (
  data: TCreateRole,
  trx?: EntityManager
): TResCreateRole => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const createMany = async (
  data: TCreateRole[],
  trx?: EntityManager
): Promise<Role[]> => {
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
  data: TUpdateRole,
  trx?: EntityManager,
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = repo(trx).createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
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
    throw new InternalServer('Data cannot be empty')
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
  const { where, withSelect, withAddSelect, withRelation, withDeleted, permanentDelete } = params

  const query = repo(trx).createQueryBuilder('role')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withAddSelect)
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
  createMany,
  update,
  updateBy,
  deleted,
  deleteBy,
}