import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

import { EStatusDelete } from '~/helpers/paramHelper'

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
    total: number
    totalPage: number
    hasPrevPage: boolean
    hasNextPage: boolean
  }
}

export type TResGetListPaginate<T> = Promise<TPaginationResponse<T>>

export const paginate = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TPaginationParams,
): Promise<TPaginationResponse<T>> => {
  const { page, limit, statusDelete } = params

  const skip = (page - 1) * limit

  query.skip(skip).take(limit)

  const [data, total] = await query.getManyAndCount()

  let withDeleted = true

  if (statusDelete === EStatusDelete.NONE) {
    withDeleted = false
  }

  const totalPage = Math.max(1, Math.ceil(total / limit))

  return {
    list: data,
    pagination: {
      page,
      limit,
      total,
      totalPage,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPage,
    },
  }
}
