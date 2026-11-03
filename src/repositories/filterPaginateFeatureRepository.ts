import { ObjectLiteral, SelectQueryBuilder } from "typeorm"
import { EStatusDelete, TParsedParams } from "~/helpers/paramHelper"

export const filterPaginateFeatureRepository = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TParsedParams
): Promise<SelectQueryBuilder<T>> => {
  const { statusDelete, search, orderBy } = params

  query
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

  return query
}