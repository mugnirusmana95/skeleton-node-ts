import { ObjectLiteral, SelectQueryBuilder } from "typeorm"
import { EStatusDelete, TParsedParams } from "~/helpers/paramHelper"

export const filterPaginateProfileRepository = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TParsedParams
): Promise<SelectQueryBuilder<T>> => {
  const { statusDelete, search, userId, orderBy } = params

  query
    .leftJoinAndSelect('profile.user', 'user')

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('profile.deletedAt')
      .addSelect('user.deletedAt')
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere('profile.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`profile.email ILIKE :search`, { search })
  }

  if (userId) {
    query.andWhere(`userId = :userId`, { userId })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        firstName: 'profile.firstName',
        middleName: 'profile.middleName',
        lastName: 'profile.lastName',
        phoneCode: 'profile.phoneCode',
        phoneNumber: 'profile.phoneNumber',
        userEmail: 'user.email',
        createdAt: 'profile.createdAt',
        updatedAt: 'profile.updatedAt',
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
    query.addOrderBy('profile.updatedAt', 'DESC')
  }

  return query
}