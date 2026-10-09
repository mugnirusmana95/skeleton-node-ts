import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

import { EStatusDelete } from '~/helpers/paramHelper'

type TPaginationParams = {
  page: number
  limit: number
  statusDelete?: EStatusDelete
}

export const paginate = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TPaginationParams,
) => {
  const { page, limit, statusDelete } = params

  const skip = (page - 1) * limit

  query.skip(skip).take(limit)

  const [data, total] = await query.getManyAndCount()

  const totalPage = Math.max(1, Math.ceil(total / limit))

  if (statusDelete === EStatusDelete.NONE) {
    data.map((item) => {
      delete item.isDeleted
      delete item.deletedAt

      return item
    })
  }

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
