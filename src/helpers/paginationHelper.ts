import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

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