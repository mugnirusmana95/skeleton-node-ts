import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { FeatureAction } from '~/entities/featureActionEntity'

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

type TCreateFeatureAction = Partial<
  Pick<FeatureAction, 'code' | 'name' | 'isActive'>
>
type TUpdateFeatureAction = Partial<TCreateFeatureAction>
type TFeatureActionField = Exclude<
  keyof FeatureAction,
  'isDeleted' | 'computeIsDeleted'
>

export type TResGetListPaginateFeatureAction = TResGetListPaginate<FeatureAction>
export type TResFindFeatureAction = Promise<FeatureAction | null>
export type TResGetFeatureAction = Promise<FeatureAction[]>
export type TResCreateFeatureAction = Promise<FeatureAction>
export type TResUpdateFeatureAction = Promise<UpdateResult>
export type TResSoftDeleteFeatureAction = TResUpdateFeatureAction
export type TResDeleteFeatureAction = DeleteResult

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(FeatureAction)

const getListPaginate = async (
  params: TParsedParams,
  trx?: EntityManager
): TResGetListPaginateFeatureAction => {
  const {
    page = 1,
    limit = 10,
    search = '',
    orderBy = [],
    statusDelete
  } = params

  const query = repo(trx)
    .createQueryBuilder('featureAction')
    .leftJoinAndSelect('featureAction.featurePermissions', 'featurePermissions')

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('featureAction.deletedAt')
      .addSelect('featurePermissions.deletedAt')
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere('featureAction.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`(featureAction.code ILIKE :search OR featureAction.name ILIKE :search)`, { search: `%${search}%` })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        code: 'featureAction.code',
        name: 'featureAction.name',
        createdAt: 'featureAction.createdAt',
        updatedAt: 'featureAction.updatedAt',
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
    query.addOrderBy('featureAction.updatedAt', 'DESC')
  }

  return paginate(query, { page, limit, statusDelete })
}

const find = async (
  params: TDynamicQueryOptions,
  trx?: EntityManager,
): Promise<FeatureAction | null> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('featureAction')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featureAction.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.groupBy(query, withGroupBy)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<FeatureAction[]> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('featureAction')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featureAction.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  return query.getMany()
}

const findBy = async <K extends TFeatureActionField>(
  params: TDynamicFieldValueWithSelect<FeatureAction, K> &
    TDynamicFieldValueWithAddSelect<FeatureAction, K> &
    TDynamicFieldValueWithRelation<FeatureAction, K> &
    TDynamicFieldValueWithDeleted<FeatureAction, K> &
    TDynamicFieldValueWithGroupBy<FeatureAction, K>,
  trx?: EntityManager,
): TResFindFeatureAction => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params

  const query = repo(trx).createQueryBuilder('featureAction')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featureAction.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`featureAction.${field} = :value`, { value })


  const data = await query.getOne()

  return data
}

const getBy = async <K extends TFeatureActionField>(
  params: TDynamicFieldValueWithSelect<FeatureAction, K> &
    TDynamicFieldValueWithAddSelect<FeatureAction, K> &
    TDynamicFieldValueWithRelation<FeatureAction, K> &
    TDynamicFieldValueWithDeleted<FeatureAction, K> &
    TDynamicFieldValueWithOrderBy<FeatureAction, K> &
    TDynamicFieldValueWithGroupBy<FeatureAction, K>,
  trx?: EntityManager
): TResGetFeatureAction => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx)
    .createQueryBuilder('featureAction')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featureAction.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`featureAction.${field} = :value`, { value })

  const data = await query.getMany()

  return data
}

const findByExceptBy = async <
  K extends TFeatureActionField,
  E extends TFeatureActionField
>(
  findParams: TDynamicFieldValueWithSelect<FeatureAction, K> &
    TDynamicFieldValueWithAddSelect<FeatureAction, K> &
    TDynamicFieldValueWithRelation<FeatureAction, K> &
    TDynamicFieldValueWithDeleted<FeatureAction, K> &
    TDynamicFieldValueWithGroupBy<FeatureAction, K>,
  exceptParams: TDynamicFieldValue<FeatureAction, E>,
  trx?: EntityManager
): TResFindFeatureAction => {
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
    .createQueryBuilder('featureAction')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featureAction.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`featureAction.${findColumn} = :findValue AND featureAction.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return data
}

const getByExceptBy = async <
  K extends TFeatureActionField,
  E extends TFeatureActionField
>(
  findParams: TDynamicFieldValueWithSelect<FeatureAction, K> &
    TDynamicFieldValueWithAddSelect<FeatureAction, K> &
    TDynamicFieldValueWithRelation<FeatureAction, K> &
    TDynamicFieldValueWithDeleted<FeatureAction, K> &
    TDynamicFieldValueWithOrderBy<FeatureAction, K> &
    TDynamicFieldValueWithGroupBy<FeatureAction, K>,
  exceptParams: TDynamicFieldValue<FeatureAction, E>,
  trx?: EntityManager
): TResGetFeatureAction => {
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
    .createQueryBuilder('featureAction')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featureAction.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`featureAction.${findColumn} = :findValue AND featureAction.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return data
}

const create = async (
  data: TCreateFeatureAction,
  trx?: EntityManager
): TResCreateFeatureAction => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const createMany = async (
  data: TCreateFeatureAction[],
  trx?: EntityManager
): Promise<FeatureAction[]> => {
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
  data: TUpdateFeatureAction,
  trx?: EntityManager,
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = repo(trx).createQueryBuilder('featureAction')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'featureAction.deletedAt', withDeleted)
  entity.condition(query, where)

  const result = await query.getMany()

  const ids = result.map((item) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  return repo(trx).update(ids, data)
}

const updateBy = async <
  K extends TFeatureActionField
>(
  params: TDynamicFieldValue<FeatureAction, K>,
  data: TUpdateFeatureAction,
  trx?: EntityManager,
): TResUpdateFeatureAction => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  const { field, value } = params
  return repo(trx).update(
    { [field]: value } as FindOptionsWhere<FeatureAction>,
    data,
  )
}

const deleted = async (
  params: TDynamicQueryDeleteOptions,
  trx?: EntityManager,
): Promise<TResSoftDeleteFeatureAction | TResDeleteFeatureAction> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, permanentDelete } = params

  const query = repo(trx).createQueryBuilder('featureAction')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withAddSelect)
  entity.withDeleted(query, 'featureAction.deletedAt', withDeleted)
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

const deleteBy = async <K extends TFeatureActionField>(
  params: TDynamicFieldValueDeleteOption<FeatureAction, K>,
  trx?: EntityManager,
): Promise<TResSoftDeleteFeatureAction | TResDeleteFeatureAction> => {
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