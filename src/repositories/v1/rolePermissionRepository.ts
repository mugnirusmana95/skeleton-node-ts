import { EntityManager, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { RolePermission } from '~/entities/rolePermissionEntity'

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

type TCreateRolePermission = Partial<
  Pick<RolePermission, 'roleId' | 'featurePermissionId' | 'isActive'>
>
type TUpdateRolePermission = Partial<TCreateRolePermission>
type TRolePermissionField = Exclude<
  keyof RolePermission,
  'isDeleted' | 'computeIsDeleted'
>

export type TResGetListPaginateRolePermission = TResGetListPaginate<RolePermission>
export type TResFindRolePermission = Promise<RolePermission | null>
export type TResGetRolePermission = Promise<RolePermission[]>
export type TResCreateRolePermission = Promise<RolePermission>
export type TResUpdateRolePermission = Promise<UpdateResult>
export type TResSoftDeleteRolePermission = TResUpdateRolePermission
export type TResDeleteRolePermission = DeleteResult

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(RolePermission)

const getListPaginate = async (
  params: TParsedParams,
  trx?: EntityManager
): TResGetListPaginateRolePermission => {
  const {
    page = 1,
    limit = 10,
    search = '',
    orderBy = [],
    statusDelete
  } = params

  const query = repo(trx)
    .createQueryBuilder('rolePermission')
    .leftJoinAndSelect('rolePermission.role', 'role')
    .leftJoinAndSelect('rolePermission.featurePermission', 'featurePermission')
    .leftJoinAndSelect('featurePermission.feature', 'feature')
    .leftJoinAndSelect('featurePermission.featureAction', 'featureAction')

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('rolePermission.deletedAt')
      .addSelect('role.deletedAt')
      .addSelect('featurePermission.deleteAt')
      .addSelect('feature.deleteAt')
      .addSelect('featureAction.deleteAt')
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere('rolePermission.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`(rolePermission.code ILIKE :search OR rolePermission.name ILIKE :search)`, { search: `%${search}%` })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        roleId: 'rolePermission.roleId',
        roleName: 'role.name',
        createdAt: 'rolePermission.createdAt',
        updatedAt: 'rolePermission.updatedAt',
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
    query.addOrderBy('rolePermission.updatedAt', 'DESC')
  }

  return paginate(query, { page, limit, statusDelete })
}

const find = async (
  params: TDynamicQueryOptions,
  trx?: EntityManager,
): Promise<RolePermission | null> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('rolePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'rolePermission.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.groupBy(query, withGroupBy)

  return query.getOne()
}

const get = async (
  params: TDynamicQueryOptionsGet,
  trx?: EntityManager,
): Promise<RolePermission[]> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx).createQueryBuilder('rolePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'rolePermission.deletedAt', withDeleted)
  entity.condition(query, where)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  return query.getMany()
}

const findBy = async <K extends TRolePermissionField>(
  params: TDynamicFieldValueWithSelect<RolePermission, K> &
    TDynamicFieldValueWithAddSelect<RolePermission, K> &
    TDynamicFieldValueWithRelation<RolePermission, K> &
    TDynamicFieldValueWithDeleted<RolePermission, K> &
    TDynamicFieldValueWithGroupBy<RolePermission, K>,
  trx?: EntityManager,
): TResFindRolePermission => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withGroupBy } = params

  const query = repo(trx).createQueryBuilder('rolePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'rolePermission.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`rolePermission.${field} = :value`, { value })


  const data = await query.getOne()

  return data
}

const getBy = async <K extends TRolePermissionField>(
  params: TDynamicFieldValueWithSelect<RolePermission, K> &
    TDynamicFieldValueWithAddSelect<RolePermission, K> &
    TDynamicFieldValueWithRelation<RolePermission, K> &
    TDynamicFieldValueWithDeleted<RolePermission, K> &
    TDynamicFieldValueWithOrderBy<RolePermission, K> &
    TDynamicFieldValueWithGroupBy<RolePermission, K>,
  trx?: EntityManager
): TResGetRolePermission => {
  const { field, value, withSelect, withAddSelect, withRelation, withDeleted, withOrderBy, withGroupBy } = params
  const query = repo(trx)
    .createQueryBuilder('rolePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'rolePermission.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`rolePermission.${field} = :value`, { value })

  const data = await query.getMany()

  return data
}

const findByExceptBy = async <
  K extends TRolePermissionField,
  E extends TRolePermissionField
>(
  findParams: TDynamicFieldValueWithSelect<RolePermission, K> &
    TDynamicFieldValueWithAddSelect<RolePermission, K> &
    TDynamicFieldValueWithRelation<RolePermission, K> &
    TDynamicFieldValueWithDeleted<RolePermission, K> &
    TDynamicFieldValueWithGroupBy<RolePermission, K>,
  exceptParams: TDynamicFieldValue<RolePermission, E>,
  trx?: EntityManager
): TResFindRolePermission => {
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
    .createQueryBuilder('rolePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'rolePermission.deletedAt', withDeleted)
  entity.groupBy(query, withGroupBy)

  query.where(`rolePermission.${findColumn} = :findValue AND rolePermission.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getOne()

  return data
}

const getByExceptBy = async <
  K extends TRolePermissionField,
  E extends TRolePermissionField
>(
  findParams: TDynamicFieldValueWithSelect<RolePermission, K> &
    TDynamicFieldValueWithAddSelect<RolePermission, K> &
    TDynamicFieldValueWithRelation<RolePermission, K> &
    TDynamicFieldValueWithDeleted<RolePermission, K> &
    TDynamicFieldValueWithOrderBy<RolePermission, K> &
    TDynamicFieldValueWithGroupBy<RolePermission, K>,
  exceptParams: TDynamicFieldValue<RolePermission, E>,
  trx?: EntityManager
): TResGetRolePermission => {
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
    .createQueryBuilder('rolePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'rolePermission.deletedAt', withDeleted)
  entity.orderBy(query, withOrderBy)
  entity.groupBy(query, withGroupBy)

  query.where(`rolePermission.${findColumn} = :findValue AND rolePermission.${exceptColumn} <> :exceptValue`, { findValue, exceptValue })

  const data = await query.getMany()

  return data
}

const create = async (
  data: TCreateRolePermission,
  trx?: EntityManager
): TResCreateRolePermission => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  return repo(trx).save(data)
}

const createMany = async (
  data: TCreateRolePermission[],
  trx?: EntityManager
): Promise<RolePermission[]> => {
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
  data: TUpdateRolePermission,
  trx?: EntityManager,
): Promise<UpdateResult> => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }
  const { where, withSelect, withAddSelect, withRelation, withDeleted } = params

  const query = repo(trx).createQueryBuilder('rolePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withSelect)
  entity.withDeleted(query, 'rolePermission.deletedAt', withDeleted)
  entity.condition(query, where)

  const result = await query.getMany()

  const ids = result.map((item) => item.id)

  if (ids.length === 0) {
    return { affected: 0, raw: [], generatedMaps: [] }
  }

  return repo(trx).update(ids, data)
}

const updateBy = async <
  K extends TRolePermissionField
>(
  params: TDynamicFieldValue<RolePermission, K>,
  data: TUpdateRolePermission,
  trx?: EntityManager,
): TResUpdateRolePermission => {
  if (Object.keys(data).length === 0) {
    throw new InternalServer('Data cannot be empty')
  }

  const { field, value } = params
  return repo(trx).update(
    { [field]: value } as FindOptionsWhere<RolePermission>,
    data,
  )
}

const deleted = async (
  params: TDynamicQueryDeleteOptions,
  trx?: EntityManager,
): Promise<TResSoftDeleteRolePermission | TResDeleteRolePermission> => {
  const { where, withSelect, withAddSelect, withRelation, withDeleted, permanentDelete } = params

  const query = repo(trx).createQueryBuilder('rolePermission')

  entity.select(query, withSelect)
  entity.addSelect(query, withAddSelect)
  entity.with(query, withRelation, withDeleted, !!withAddSelect)
  entity.withDeleted(query, 'rolePermission.deletedAt', withDeleted)
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

const deleteBy = async <K extends TRolePermissionField>(
  params: TDynamicFieldValueDeleteOption<RolePermission, K>,
  trx?: EntityManager,
): Promise<TResSoftDeleteRolePermission | TResDeleteRolePermission> => {
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