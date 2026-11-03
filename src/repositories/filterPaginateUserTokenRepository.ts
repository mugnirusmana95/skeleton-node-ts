import { ObjectLiteral, SelectQueryBuilder } from "typeorm"
import { EStatusDelete, TParsedParams } from "~/helpers/paramHelper"

export const filterPaginateUserTokenRepository = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TParsedParams
): Promise<SelectQueryBuilder<T>> => {
  const { statusDelete, search, userId, orderBy } = params

  query
    .leftJoinAndSelect('userToken.user', 'user')

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('userToken.deletedAt')
      .addSelect('user.deletedAt')
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere('userToken.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`userToken.email ILIKE :search`, { search })
  }

  if (userId) {
    query.andWhere(`userId = :userId`, { userId })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        firstName: 'userToken.firstName',
        middleName: 'userToken.middleName',
        lastName: 'userToken.lastName',
        phoneCode: 'userToken.phoneCode',
        phoneNumber: 'userToken.phoneNumber',
        userEmail: 'user.email',
        createdAt: 'userToken.createdAt',
        updatedAt: 'userToken.updatedAt',
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
    query.addOrderBy('userToken.updatedAt', 'DESC')
  }

  return query
}