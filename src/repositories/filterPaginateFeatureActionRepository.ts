import { ObjectLiteral, SelectQueryBuilder } from "typeorm"
import { EStatusDelete, TParsedParams } from "~/helpers/paramHelper"

export const filterPaginateFeatureActionRepository = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TParsedParams
): Promise<SelectQueryBuilder<T>> => {
  const { statusDelete, search, orderBy } = params

  query.leftJoinAndSelect('featureAction.featurePermissions', 'featurePermissions')

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

  return query
}