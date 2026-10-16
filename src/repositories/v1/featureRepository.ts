import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { Feature } from '~/entities/featureEntity'

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

type TCreateFeature = Partial<
  Pick<Feature, 'code' | 'name' | 'isActive'>
>
type TUpdateFeature = Partial<TCreateFeature>
type TFeatureField = Exclude<
  keyof Feature,
  'isDeleted' | 'computeIsDeleted'
>

export type TResGetListPaginateFeature = TResGetListPaginate<Feature>
export type TResFindFeature = Promise<Feature | null>
export type TResGetFeature = Promise<Feature[]>
export type TResCreateFeature = Promise<Feature>
export type TResUpdateFeature = Promise<UpdateResult>
export type TResSoftDeleteFeature = TResUpdateFeature
export type TResDeleteFeature = DeleteResult

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(Feature)

const getListPaginate = async (
  params: TParsedParams,
  trx?: EntityManager
): TResGetListPaginateFeature => {
  const {
    page = 1,
    limit = 10,
    search = '',
    orderBy = [],
    statusDelete
  } = params

  const query = repo(trx)
    .createQueryBuilder('feature')
    .leftJoinAndSelect('feature.featurePermissions', 'featurePermissions')

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('feature.deletedAt')
      .addSelect('featurePermissions.deletedAt')
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere('feature.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`(feature.code ILIKE :search OR feature.name ILIKE :search)`, { search: `%${search}%` })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        code: 'feature.code',
        name: 'feature.name',
        createdAt: 'feature.createdAt',
        updatedAt: 'feature.updatedAt',
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
    query.addOrderBy('feature.updatedAt', 'DESC')
  }

  return paginate(query, { page, limit, statusDelete })
}

const find = async (
  params: TDynamicQueryOptions,
  trx?: EntityManager,
): Promise<Feature | null> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('feature')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'feature.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.groupBy(query, withGroupBy)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<Feature[]> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('feature')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'feature.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  return query.getMany()
}

const findBy = async <K extends TFeatureField>(
  params: TDynamicFieldValueWithSelect<Feature, K> &
    TDynamicFieldValueWithAddSelect<Feature, K> &
    TDynamicFieldValueWithRelation<Feature, K> &
    TDynamicFieldValueWithDeleted<Feature, K> &
    TDynamicFieldValueWithGroupBy<Feature, K>,
  trx?: EntityManager,
): TResFindFeature => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params

  const query = repo(trx).createQueryBuilder('feature')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'feature.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`feature.${field} = :value`, { value })


  const data = await query.getOne()

  return data
}

const getBy = async <K extends TFeatureField>(
  params: TDynamicFieldValueWithSelect<Feature, K> &
    TDynamicFieldValueWithAddSelect<Feature, K> &
    TDynamicFieldValueWithRelation<Feature, K> &
    TDynamicFieldValueWithDeleted<Feature, K> &
    TDynamicFieldValueWithOrderBy<Feature, K> &
    TDynamicFieldValueWithGroupBy<Feature, K>,
  trx?: EntityManager
): TResGetFeature => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx)
    .createQueryBuilder('feature')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'feature.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`feature.${field} = :value`, { value })

  const data = await query.getMany()

  return data
}

const findByExceptBy = async <
  K extends TFeatureField,
  E extends TFeatureField
>(
  findParams: TDynamicFieldValueWithSelect<Feature, K> &
    TDynamicFieldValueWithAddSelect<Feature, K> &
    TDynamicFieldValueWithRelation<Feature, K> &
    TDynamicFieldValueWithDeleted<Feature, K> &
    TDynamicFieldValueWithGroupBy<Feature, K>,
  exceptParams: TDynamicFieldValue<Feature, E>,
  trx?: EntityManager
): TResFindFeature => {
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
    .createQueryBuilder('feature')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'feature.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`feature.${findColumn} = :findValue AND feature.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return data
}

const getByExceptBy = async <
  K extends TFeatureField,
  E extends TFeatureField
>(
  findParams: TDynamicFieldValueWithSelect<Feature, K> &
    TDynamicFieldValueWithAddSelect<Feature, K> &
    TDynamicFieldValueWithRelation<Feature, K> &
    TDynamicFieldValueWithDeleted<Feature, K> &
    TDynamicFieldValueWithOrderBy<Feature, K> &
    TDynamicFieldValueWithGroupBy<Feature, K>,
  exceptParams: TDynamicFieldValue<Feature, E>,
  trx?: EntityManager
): TResGetFeature => {
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
    .createQueryBuilder('feature')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'feature.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`feature.${findColumn} = :findValue AND feature.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return data
}

const create = async (
  data: TCreateFeature,
  trx?: EntityManager
): TResCreateFeature => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const createMany = async (
  data: TCreateFeature[],
  trx?: EntityManager
): Promise<Feature[]> => {
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
  data: TUpdateFeature,
  trx?: EntityManager,
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = repo(trx).createQueryBuilder('feature')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'feature.deletedAt', withDeleted)
  entity.condition(query, where)

  const result = await query.getMany()

  const ids = result.map((item) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  return repo(trx).update(ids, data)
}

const updateBy = async <
  K extends TFeatureField
>(
  params: TDynamicFieldValue<Feature, K>,
  data: TUpdateFeature,
  trx?: EntityManager,
): TResUpdateFeature => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  const { field, value } = params
  return repo(trx).update(
    { [field]: value } as FindOptionsWhere<Feature>,
    data,
  )
}

const deleted = async (
  params: TDynamicQueryDeleteOptions,
  trx?: EntityManager,
): Promise<TResSoftDeleteFeature | TResDeleteFeature> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, permanentDelete } = params

  const query = repo(trx).createQueryBuilder('feature')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withAddSelect)
  entity.withDeleted(query, 'feature.deletedAt', withDeleted)
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

const deleteBy = async <K extends TFeatureField>(
  params: TDynamicFieldValueDeleteOption<Feature, K>,
  trx?: EntityManager,
): Promise<TResSoftDeleteFeature | TResDeleteFeature> => {
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