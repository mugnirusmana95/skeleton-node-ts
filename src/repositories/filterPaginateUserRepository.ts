import { ObjectLiteral, SelectQueryBuilder } from "typeorm"

import { EStatusDelete, TParsedParams } from "~/helpers/paramHelper"

export const filterPaginateUserRepository = async <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  params: TParsedParams
): Promise<SelectQueryBuilder<T>> => {
  const { statusDelete, search, roleId, orderBy } = params

  query
    .leftJoinAndSelect('user.role', 'role')
    .leftJoinAndSelect('user.profile', 'profile')

  if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('user.deletedAt')
      .addSelect('role.deletedAt')
      .addSelect('profile.deletedAt')
  }

  if (statusDelete === EStatusDelete.ONLY) {
    query.andWhere('user.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`(
        user.email ILIKE :search OR
        profile.firstName ILIKE :search OR
        profile.middleName ILIKE :search OR
        profile.lastName ILIKE :search OR
        profile.phoneCode ILIKE :search OR
        profile.phoneNumber ILIKE :search
      )`,
      { search: `%${search}%` })
  }

  if (roleId) {
    query.andWhere(`user.roleId = :roleId`, { roleId })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        name: 'user.email',
        roleName: 'role.name',
        createdAt: 'user.createdAt',
        updatedAt: 'user.updatedAt',
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
    query.addOrderBy('user.updatedAt', 'DESC')
  }

  return query
}