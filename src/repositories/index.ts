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
import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'
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
  options?: TPaginateOptions<T>,
  trx?: EntityManager
): TResGetListPaginate<T> => {
  const alias = getAlias(target, trx)
  const {
    page = 1,
    limit = 10,
    search = '',
    orderBy = [],
    statusDelete,
  } = params

  const query = getRepo(target, trx).createQueryBuilder(alias)

  if (options?.relations && options.relations.length > 0) {
    for (const rel of options.relations) {
      query.leftJoinAndSelect(rel.relation, rel.alias)
    }
  }

  const deletedAtCol = getDeletedAtColumn(target, alias, trx)
  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query.withDeleted().addSelect(deletedAtCol)
    if (options?.relations) {
      for (const rel of options.relations) {
        query.addSelect(`${rel.alias}.deletedAt`)
      }
    }
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere(`${deletedAtCol} IS NOT NULL`)
  }

  if (search && options?.searchFields && options.searchFields.length > 0) {
    const searchConditions = options.searchFields
      .map((col) => `${col} ILIKE :search`)
      .join(' OR ')
    query.andWhere(`(${searchConditions})`, { search: `%${search}%` })
  }

  if (options?.customFilter) {
    options.customFilter(query)
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const col = options?.columnMap?.[item.column] || `${alias}.${item.column}`
      query.addOrderBy(col, item.direction.toUpperCase() as 'ASC' | 'DESC')
    }
  } else if (options?.defaultOrderBy) {
    query.addOrderBy(options.defaultOrderBy.column, options.defaultOrderBy.direction)
  } else {
    query.addOrderBy(`${alias}.updatedAt`, 'DESC')
  }

  return paginate(query, { page, limit, statusDelete })
}

/**
 * Creates a scoped repository instance bound to a specific entity target.
 */
export const of = <T extends ObjectLiteral>(target: EntityTarget<T>) => ({
  find: (params: TDynamicQueryOptions, trx?: EntityManager) => find(target, params, trx),
  get: (params: TDynamicQueryOptionsGet, trx?: EntityManager) => get(target, params, trx),
  findBy: <K extends TStringKey<T>>(
    params: TDynamicFieldValueWithSelect<T, K> &
      TDynamicFieldValueWithAddSelect<T, K> &
      TDynamicFieldValueWithRelation<T, K> &
      TDynamicFieldValueWithDeleted<T, K> &
      TDynamicFieldValueWithGroupBy<T, K>,
    trx?: EntityManager
  ) => findBy(target, params, trx),
  findWhere: (params: TDynamicQueryOptions, trx?: EntityManager) => findWhere(target, params, trx),
  getBy: <K extends TStringKey<T>>(
    params: TDynamicFieldValueWithSelect<T, K> &
      TDynamicFieldValueWithAddSelect<T, K> &
      TDynamicFieldValueWithRelation<T, K> &
      TDynamicFieldValueWithDeleted<T, K> &
      TDynamicFieldValueWithOrderBy<T, K> &
      TDynamicFieldValueWithGroupBy<T, K>,
    trx?: EntityManager
  ) => getBy(target, params, trx),
  getWhere: (params: TDynamicQueryOptions, trx?: EntityManager) => getWhere(target, params, trx),
  findByExceptBy: <K extends TStringKey<T>, E extends TStringKey<T>>(
    findParams: TDynamicFieldValueWithSelect<T, K> &
      TDynamicFieldValueWithAddSelect<T, K> &
      TDynamicFieldValueWithRelation<T, K> &
      TDynamicFieldValueWithDeleted<T, K> &
      TDynamicFieldValueWithGroupBy<T, K>,
    exceptParams: TDynamicFieldValue<T, E>,
    trx?: EntityManager
  ) => findByExceptBy(target, findParams, exceptParams, trx),
  getByExceptBy: <K extends TStringKey<T>, E extends TStringKey<T>>(
    findParams: TDynamicFieldValueWithSelect<T, K> &
      TDynamicFieldValueWithAddSelect<T, K> &
      TDynamicFieldValueWithRelation<T, K> &
      TDynamicFieldValueWithDeleted<T, K> &
      TDynamicFieldValueWithOrderBy<T, K> &
      TDynamicFieldValueWithGroupBy<T, K>,
    exceptParams: TDynamicFieldValue<T, E>,
    trx?: EntityManager
  ) => getByExceptBy(target, findParams, exceptParams, trx),
  create: (data: Partial<T>, trx?: EntityManager) => create(target, data, trx),
  createMany: (data: Partial<T>[], trx?: EntityManager) => createMany(target, data, trx),
  update: (params: TDynamicQueryOptions, data: Partial<T>, trx?: EntityManager) =>
    update(target, params, data, trx),
  updateBy: <K extends TStringKey<T>>(
    params: TDynamicFieldValue<T, K>,
    data: Partial<T>,
    trx?: EntityManager
  ) => updateBy(target, params, data, trx),
  deleted: (params: TDynamicQueryDeleteOptions, trx?: EntityManager) =>
    deleted(target, params, trx),
  deleteBy: <K extends TStringKey<T>>(
    params: TDynamicFieldValueDeleteOption<T, K>,
    trx?: EntityManager
  ) => deleteBy(target, params, trx),
  getListPaginate: (params: TParsedParams, options?: TPaginateOptions<T>, trx?: EntityManager) =>
    getListPaginate(target, params, options, trx),
})

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
  of,
}

export default repository
