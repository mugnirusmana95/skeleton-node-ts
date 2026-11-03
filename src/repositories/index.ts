import {
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
  SelectQueryBuilder,
  UpdateResult,
  DeleteResult,
} from 'typeorm'
import { AppDataSource } from '~/configs/dataSource'
import { InternalServer } from '~/helpers/exceptionHelper'
import entityHelper, {
  TDynamicFieldValue,
  TDynamicFieldValueDeleteOption,
  TDynamicFieldValueWithAddSelect,
  TDynamicFieldValueWithDeleted,
  TDynamicFieldValueWithGroupBy,
  TDynamicFieldValueWithOrderBy,
  TDynamicFieldValueWithRelation,
  TDynamicFieldValueWithSelect,
  TDynamicQueryDeleteOptions,
  TDynamicQueryOptions,
  TDynamicQueryOptionsGet,
  TStringKey,
} from '~/helpers/entityHelper'
import { TParsedParams } from '~/helpers/paramHelper'
import { paginate, TResGetListPaginate } from '~/helpers/paginationHelper'

export type { TResGetListPaginate } from '~/helpers/paginationHelper'
export type TResFind<T> = Promise<T | null>
export type TResGet<T> = Promise<T[]>

export type TPaginateOptions<T extends ObjectLiteral = ObjectLiteral> = {
  searchFields?: string[]
  relations?: { relation: string; alias: string }[]
  columnMap?: Record<string, string>
  defaultOrderBy?: { column: string; direction: 'ASC' | 'DESC' }
  customFilter?: (query: SelectQueryBuilder<T>) => void
}

const getRepo = <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  trx?: EntityManager
) => (trx ?? AppDataSource).getRepository(target)

const getAlias = <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  trx?: EntityManager
): string => {
  const metadata = getRepo(target, trx).metadata
  const name = metadata.targetName || metadata.tableName
  return name[0].toLowerCase() + name.slice(1)
}

const getDeletedAtColumn = <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  alias: string,
  trx?: EntityManager
): string => {
  const metadata = getRepo(target, trx).metadata
  const prop = metadata.deleteDateColumn?.propertyName ?? 'deletedAt'
  return `${alias}.${prop}`
}

export const find = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  params: TDynamicQueryOptions,
  trx?: EntityManager
): Promise<T | null> => {
  const alias = getAlias(target, trx)
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.condition(query, where)
  entityHelper.groupBy(query, withGroupBy)

  return query.getOne()
}

export const get = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager
): Promise<T[]> => {
  const alias = getAlias(target, trx)
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.condition(query, where)
  entityHelper.orderBy(query, withOrderBy)
  entityHelper.groupBy(query, withGroupBy)

  return query.getMany()
}

export const findBy = async <T extends ObjectLiteral, K extends TStringKey<T>>(
  target: EntityTarget<T>,
  params: TDynamicFieldValueWithSelect<T, K> &
    TDynamicFieldValueWithAddSelect<T, K> &
    TDynamicFieldValueWithRelation<T, K> &
    TDynamicFieldValueWithDeleted<T, K> &
    TDynamicFieldValueWithGroupBy<T, K>,
  trx?: EntityManager
): Promise<T | null> => {
  const alias = getAlias(target, trx)
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.groupBy(query, withGroupBy)

  query.where(`${alias}.${String(field)} = :value`, { value })

  return query.getOne()
}

export const findWhere = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  params: TDynamicQueryOptions,
  trx?: EntityManager
): Promise<T | null> => {
  const alias = getAlias(target, trx)
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.condition(query, where)

  return query.getOne()
}

export const getBy = async <T extends ObjectLiteral, K extends TStringKey<T>>(
  target: EntityTarget<T>,
  params: TDynamicFieldValueWithSelect<T, K> &
    TDynamicFieldValueWithAddSelect<T, K> &
    TDynamicFieldValueWithRelation<T, K> &
    TDynamicFieldValueWithDeleted<T, K> &
    TDynamicFieldValueWithOrderBy<T, K> &
    TDynamicFieldValueWithGroupBy<T, K>,
  trx?: EntityManager
): Promise<T[]> => {
  const alias = getAlias(target, trx)
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.orderBy(query, withOrderBy)
  entityHelper.groupBy(query, withGroupBy)

  query.where(`${alias}.${String(field)} = :value`, { value })

  return query.getMany()
}

export const getWhere = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  params: TDynamicQueryOptions,
  trx?: EntityManager
): Promise<T[]> => {
  const alias = getAlias(target, trx)
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.condition(query, where)

  return query.getMany()
}

export const findByExceptBy = async <
  T extends ObjectLiteral,
  K extends TStringKey<T>,
  E extends TStringKey<T>
>(
  target: EntityTarget<T>,
  findParams: TDynamicFieldValueWithSelect<T, K> &
    TDynamicFieldValueWithAddSelect<T, K> &
    TDynamicFieldValueWithRelation<T, K> &
    TDynamicFieldValueWithDeleted<T, K> &
    TDynamicFieldValueWithGroupBy<T, K>,
  exceptParams: TDynamicFieldValue<T, E>,
  trx?: EntityManager
): Promise<T | null> => {
  const alias = getAlias(target, trx)
  const findColumn = findParams.field
  const findValue = findParams.value
  const withSelect = findParams.withSelect
  const withAddSelect = findParams.withAddSelect
  const withRelation = findParams.withRelation
  const withDeleted = findParams.withDeleted
  const withGroupBy = findParams.withGroupBy
  const exceptColumn = exceptParams.field
  const exceptValue = exceptParams.value

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.groupBy(query, withGroupBy)

  query.where(
    `${alias}.${String(findColumn)} = :findValue AND ${alias}.${String(exceptColumn)} <> :exceptValue`,
    { findValue, exceptValue }
  )

  return query.getOne()
}

export const getByExceptBy = async <
  T extends ObjectLiteral,
  K extends TStringKey<T>,
  E extends TStringKey<T>
>(
  target: EntityTarget<T>,
  findParams: TDynamicFieldValueWithSelect<T, K> &
    TDynamicFieldValueWithAddSelect<T, K> &
    TDynamicFieldValueWithRelation<T, K> &
    TDynamicFieldValueWithDeleted<T, K> &
    TDynamicFieldValueWithOrderBy<T, K> &
    TDynamicFieldValueWithGroupBy<T, K>,
  exceptParams: TDynamicFieldValue<T, E>,
  trx?: EntityManager
): Promise<T[]> => {
  const alias = getAlias(target, trx)
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

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.orderBy(query, withOrderBy)
  entityHelper.groupBy(query, withGroupBy)

  query.where(
    `${alias}.${String(findColumn)} = :findValue AND ${alias}.${String(exceptColumn)} <> :exceptValue`,
    { findValue, exceptValue }
  )

  return query.getMany()
}

export const create = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  data: Partial<T>,
  trx?: EntityManager
): Promise<T> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  return getRepo(target, trx).save(data as any)
}

export const createMany = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  data: Partial<T>[],
  trx?: EntityManager
): Promise<T[]> => {
  if (
    data.length === 0 ||
    data.some((item) => Object.keys(item).length === 0)
  ) {
    throw new InternalServer('Data cannot be empty')
  }

  return getRepo(target, trx).save(data as any)
}

export const update = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  params: TDynamicQueryOptions,
  data: Partial<T>,
  trx?: EntityManager
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  const alias = getAlias(target, trx)
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.condition(query, where)

  const result = await query.getMany()
  const ids = result.map((item: any) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  return getRepo(target, trx).update(ids, data as any)
}

export const updateBy = async <T extends ObjectLiteral, K extends TStringKey<T>>(
  target: EntityTarget<T>,
  params: TDynamicFieldValue<T, K>,
  data: Partial<T>,
  trx?: EntityManager
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  const { field, value } = params
  return getRepo(target, trx).update(
    { [field]: value } as FindOptionsWhere<T>,
    data as any
  )
}

export const deleted = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  params: TDynamicQueryDeleteOptions,
  trx?: EntityManager
): Promise<UpdateResult | DeleteResult> => {
  const alias = getAlias(target, trx)
  const { where, withSelect, withAddSelect, withRelation, withDeleted, permanentDelete } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)

  entityHelper.select(query, withSelect)
  entityHelper.addSelect(query, withAddSelect)
  entityHelper.with(query, withRelation, withDeleted, !!withAddSelect)
  entityHelper.withDeleted(query, getDeletedAtColumn(target, alias, trx), withDeleted)
  entityHelper.condition(query, where)

  const data = await query.getMany()
  const ids = data.map((item: any) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  if (permanentDelete) {
    return getRepo(target, trx).delete(ids)
  }

  return getRepo(target, trx).softDelete(ids)
}

export const deleteBy = async <T extends ObjectLiteral, K extends TStringKey<T>>(
  target: EntityTarget<T>,
  params: TDynamicFieldValueDeleteOption<T, K>,
  trx?: EntityManager
): Promise<UpdateResult | DeleteResult> => {
  const { field, value, permanentDelete } = params
  if (permanentDelete) {
    return getRepo(target, trx).delete({
      [field]: value,
    } as FindOptionsWhere<T>)
  }
  return getRepo(target, trx).softDelete({
    [field]: value,
  } as FindOptionsWhere<T>)
}

export const getListPaginate = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  params: TParsedParams,
  trx?: EntityManager
): TResGetListPaginate<T> => {
  const alias = getAlias(target, trx)
  const { page = 1, limit = 10 } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)
  await query.filterList(params)
  return paginate(query, { page, limit })
}

export const getList = async <T extends ObjectLiteral>(
  target: EntityTarget<T>,
  params: TParsedParams,
  trx?: EntityManager
): Promise<SelectQueryBuilder<T>> => {
  const alias = getAlias(target, trx)

  const query = getRepo(target, trx).createQueryBuilder(alias)
  await query.filterList(params)
  return query
}

export const repository = {
  find,
  get,
  findBy,
  findWhere,
  getBy,
  getWhere,
  findByExceptBy,
  getByExceptBy,
  create,
  createMany,
  update,
  updateBy,
  deleted,
  deleteBy,
  getListPaginate,
  getList,
}

export default repository
