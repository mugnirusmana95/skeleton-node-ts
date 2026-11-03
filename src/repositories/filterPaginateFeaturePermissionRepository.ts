import { ObjectLiteral, SelectQueryBuilder } from "typeorm"
import { EStatusDelete, TParsedParams } from "~/helpers/paramHelper"

export const filterPaginateFeaturePermissionRepository = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TParsedParams
): Promise<SelectQueryBuilder<T>> => {
  const { statusDelete, search, orderBy } = params

  query
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

  return query
}