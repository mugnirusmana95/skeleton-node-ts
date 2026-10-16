import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { FeaturePermission } from '~/entities/featurePermissionEntity'

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

type TCreateFeaturePermission = Partial<
  Pick<FeaturePermission, 'featureId' | 'featureActionId' | 'isActive'>
>
type TUpdateFeaturePermission = Partial<TCreateFeaturePermission>
type TFeaturePermissionField = Exclude<
  keyof FeaturePermission,
  'isDeleted' | 'computeIsDeleted'
>

export type TResGetListPaginateFeaturePermission = TResGetListPaginate<FeaturePermission>
export type TResFindFeaturePermission = Promise<FeaturePermission | null>
export type TResGetFeaturePermission = Promise<FeaturePermission[]>
export type TResCreateFeaturePermission = Promise<FeaturePermission>
export type TResUpdateFeaturePermission = Promise<UpdateResult>
export type TResSoftDeleteFeaturePermission = TResUpdateFeaturePermission
export type TResDeleteFeaturePermission = DeleteResult

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(FeaturePermission)

const getListPaginate = async (
  params: TParsedParams,
  trx?: EntityManager
): TResGetListPaginateFeaturePermission => {
  const {
    page = 1,
    limit = 10,
    search = '',
    orderBy = [],
    statusDelete
  } = params

  const query = repo(trx)
    .createQueryBuilder('featurePermission')
    .leftJoinAndSelect('featurePermission.feature', 'feature')
    .leftJoinAndSelect('featurePermission.featureAction', 'featureAction')

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('featurePermission.deletedAt')
      .addSelect('feature.deletedAt')
      .addSelect('featureAction.deletedAt')
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere('featurePermission.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`(featurePermission.code ILIKE :search OR featurePermission.name ILIKE :search)`, { search: `%${search}%` })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        featureId: 'featurePermission.featureId',
        featureName: 'feature.name',
        featureActionId: 'featurePermission.featureActionId',
        featureActionName: 'featureAction.name',
        createdAt: 'featurePermission.createdAt',
        updatedAt: 'featurePermission.updatedAt',
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
    query.addOrderBy('featurePermission.updatedAt', 'DESC')
  }

  return paginate(query, { page, limit, statusDelete })
}

const find = async (
  params: TDynamicQueryOptions,
  trx?: EntityManager,
): Promise<FeaturePermission | null> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('featurePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featurePermission.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.groupBy(query, withGroupBy)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<FeaturePermission[]> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('featurePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featurePermission.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  return query.getMany()
}

const findBy = async <K extends TFeaturePermissionField>(
  params: TDynamicFieldValueWithSelect<FeaturePermission, K> &
    TDynamicFieldValueWithAddSelect<FeaturePermission, K> &
    TDynamicFieldValueWithRelation<FeaturePermission, K> &
    TDynamicFieldValueWithDeleted<FeaturePermission, K> &
    TDynamicFieldValueWithGroupBy<FeaturePermission, K>,
  trx?: EntityManager,
): TResFindFeaturePermission => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params

  const query = repo(trx).createQueryBuilder('featurePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featurePermission.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`featurePermission.${field} = :value`, { value })


  const data = await query.getOne()

  return data
}

const getBy = async <K extends TFeaturePermissionField>(
  params: TDynamicFieldValueWithSelect<FeaturePermission, K> &
    TDynamicFieldValueWithAddSelect<FeaturePermission, K> &
    TDynamicFieldValueWithRelation<FeaturePermission, K> &
    TDynamicFieldValueWithDeleted<FeaturePermission, K> &
    TDynamicFieldValueWithOrderBy<FeaturePermission, K> &
    TDynamicFieldValueWithGroupBy<FeaturePermission, K>,
  trx?: EntityManager
): TResGetFeaturePermission => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx)
    .createQueryBuilder('featurePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featurePermission.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`featurePermission.${field} = :value`, { value })

  const data = await query.getMany()

  return data
}

const findByExceptBy = async <
  K extends TFeaturePermissionField,
  E extends TFeaturePermissionField
>(
  findParams: TDynamicFieldValueWithSelect<FeaturePermission, K> &
    TDynamicFieldValueWithAddSelect<FeaturePermission, K> &
    TDynamicFieldValueWithRelation<FeaturePermission, K> &
    TDynamicFieldValueWithDeleted<FeaturePermission, K> &
    TDynamicFieldValueWithGroupBy<FeaturePermission, K>,
  exceptParams: TDynamicFieldValue<FeaturePermission, E>,
  trx?: EntityManager
): TResFindFeaturePermission => {
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
    .createQueryBuilder('featurePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featurePermission.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`featurePermission.${findColumn} = :findValue AND featurePermission.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return data
}

const getByExceptBy = async <
  K extends TFeaturePermissionField,
  E extends TFeaturePermissionField
>(
  findParams: TDynamicFieldValueWithSelect<FeaturePermission, K> &
    TDynamicFieldValueWithAddSelect<FeaturePermission, K> &
    TDynamicFieldValueWithRelation<FeaturePermission, K> &
    TDynamicFieldValueWithDeleted<FeaturePermission, K> &
    TDynamicFieldValueWithOrderBy<FeaturePermission, K> &
    TDynamicFieldValueWithGroupBy<FeaturePermission, K>,
  exceptParams: TDynamicFieldValue<FeaturePermission, E>,
  trx?: EntityManager
): TResGetFeaturePermission => {
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
    .createQueryBuilder('featurePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featurePermission.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`featurePermission.${findColumn} = :findValue AND featurePermission.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return data
}

const create = async (
  data: TCreateFeaturePermission,
  trx?: EntityManager
): TResCreateFeaturePermission => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const createMany = async (
  data: TCreateFeaturePermission[],
  trx?: EntityManager
): Promise<FeaturePermission[]> => {
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
  data: TUpdateFeaturePermission,
  trx?: EntityManager,
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = repo(trx).createQueryBuilder('featurePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featurePermission.deletedAt', withDeleted)
  entity.condition(query, where)

  const result = await query.getMany()

  const ids = result.map((item) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  return repo(trx).update(ids, data)
}

const updateBy = async <K extends TFeaturePermissionField>(
  params: TDynamicFieldValue<FeaturePermission, K>,
  data: TUpdateFeaturePermission,
  trx?: EntityManager,
): TResUpdateFeaturePermission => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  const { field, value } = params

  return repo(trx).update(
    { [field]: value } as FindOptionsWhere<FeaturePermission>,
    data,
  )
}

const deleted = async (
  params: TDynamicQueryDeleteOptions,
  trx?: EntityManager,
): Promise<TResSoftDeleteFeaturePermission | TResDeleteFeaturePermission> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, permanentDelete } = params

  const query = repo(trx).createQueryBuilder('featurePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withAddSelect)
  entity.withDeleted(query, 'featurePermission.deletedAt', withDeleted)
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

const deleteBy = async <K extends TFeaturePermissionField>(
  params: TDynamicFieldValueDeleteOption<FeaturePermission, K>,
  trx?: EntityManager,
): Promise<TResSoftDeleteFeaturePermission | TResDeleteFeaturePermission> => {
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