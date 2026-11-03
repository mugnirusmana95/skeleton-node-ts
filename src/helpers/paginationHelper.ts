import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

import { filterPaginateFeatureActionRepository } from "~/repositories/filterPaginateFeatureActionRepository";
import { filterPaginateFeaturePermissionRepository } from "~/repositories/filterPaginateFeaturePermissionRepository";
import { filterPaginateFeatureRepository } from "~/repositories/filterPaginateFeatureRepository";
import { filterPaginateProfileRepository } from "~/repositories/filterPaginateProfileRepository";
import { filterPaginateRolePermissionRepository } from "~/repositories/filterPaginateRolePermissionRepository";
import { filterPaginateRoleRepository } from "~/repositories/filterPaginateRoleRepository";
import { filterPaginateUserRepository } from "~/repositories/filterPaginateUserRepository";
import { filterPaginateUserTokenRepository } from "~/repositories/filterPaginateUserTokenRepository";

type TPaginationParams = {
  page: number
  limit: number
  statusDelete?: EStatusDelete
}

export type TPaginationResponse<T> = {
  list: T[]
  pagination: {
    page: number
    limit: number
    totalData: number
    totalPage: number
    hasPrevPage: boolean
    hasNextPage: boolean
  }
}

export enum EFilterPagination {
  ROLE = 'paginateroleRepository',
  USER = 'paginateuserRepository',
  FEATURE = 'paginatefeatureRepository',
  FEATURE_PERMISSION = 'paginatefeaturePermissionRepository',
  FEATURE_ACTION = 'paginatefeatureActionRepository',
  ROLE_PERMISSION = 'rolePermission',
  PROFILE = 'paginateprofileRepository',
  USER_TOKEN = 'userToken'
}

export type TResGetListPaginate<T> = Promise<TPaginationResponse<T>>

export const paginate = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TPaginationParams,
): TResGetListPaginate<T> => {
  const { page, limit } = params

  const skip = (page - 1) * limit

  query.skip(skip).take(limit)

  const [data, totalData] = await query.getManyAndCount()

  const totalPage = Math.max(1, Math.ceil(totalData / limit))

  return {
    list: data,
    pagination: {
      page,
      limit,
      totalData,
      totalPage,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPage,
    },
  }
}

const filterPaginate = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TParsedParams,
  type: EFilterPagination
): Promise<void> => {
  switch (type) {
    case EFilterPagination.ROLE:
      await filterPaginateRoleRepository<T>(query, params)
      break
    case EFilterPagination.USER:
      await filterPaginateUserRepository<T>(query, params)
      break
    case EFilterPagination.FEATURE:
      await filterPaginateFeatureRepository<T>(query, params)
      break
    case EFilterPagination.FEATURE_PERMISSION:
      await filterPaginateFeaturePermissionRepository<T>(query, params)
      break
    case EFilterPagination.FEATURE_ACTION:
      await filterPaginateFeatureActionRepository<T>(query, params)
      break
    case EFilterPagination.PROFILE:
      await filterPaginateProfileRepository<T>(query, params)
      break
    case EFilterPagination.ROLE_PERMISSION:
      await filterPaginateRolePermissionRepository<T>(query, params)
      break
    case EFilterPagination.USER_TOKEN:
      await filterPaginateUserTokenRepository<T>(query, params)
      break
    default:
      throw new Error('Invalid filter pagination type')
  }
}

export default filterPaginate