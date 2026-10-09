import { EntityManager } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { Role } from '~/entities/roleEntity'

import { TParsedParams, EStatusDelete } from '~/helpers/paramHelper'
import { paginate } from '~/helpers/paginationHelper'

import userRepository from '~/repositories/v1/userRepository'

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(Role)

const getListPaginate = async (params: TParsedParams, trx?: EntityManager) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    orderBy = [],
    statusDelete
  } = params

  const query = repo(trx)
    .createQueryBuilder('role')

  if (statusDelete === EStatusDelete.WITH) {
    query
      .withDeleted()
      .addSelect('role.deletedAt')
  } else if (statusDelete === EStatusDelete.ONLY) {
    query
      .withDeleted()
      .addSelect('role.deletedAt')
      .andWhere('role.deletedAt IS NOT NULL')
  }

  if (search) {
    query.andWhere(`(role.code ILIKE :search OR role.name ILIKE :search)`, { search: `%${search}%` })
  }

  if (orderBy && orderBy.length > 0) {
    for (const item of orderBy) {
      const columnMap: Record<string, string> = {
        code: 'role.code',
        name: 'role.name',
        createdAt: 'role.createdAt',
        updatedAt: 'role.updatedAt',
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
    query.addOrderBy('role.updatedAt', 'DESC')
  }

  return await paginate(query, { page, limit, statusDelete })
}

const findById = (id: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('role')
    .where('role.id = :id', { id })
    .getOne()

const findByIdWithDeleted = (id: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('role')
    .withDeleted()
    .where('role.id = :id', { id })
    .getOne()

const findByCode = (code: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('role')
    .where('role.code = :code', { code })
    .getOne()

const findByCodeWithDeleted = (code: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('role')
    .withDeleted()
    .where('role.code = :code', { code })
    .getOne()

const findByName = (name: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('role')
    .where('role.name = :name', { name })
    .getOne()

const findByNameWithDeleted = (name: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('role')
    .withDeleted()
    .where('role.name = :name', { name })
    .getOne()

const create = async (data: {
  code: string
  name: string
  isActive?: boolean
}, trx?: EntityManager) => {
  const save = await repo(trx).save(data)
  return await findById(save?.id, trx)
}

const deleteById = async (id: string, trx?: EntityManager) => {
  const data = await findById(id, trx)
  if (!data) throw new Error('Role not found')

  const users = await userRepository.getByRoleId(id, trx)
  if (users.length > 0) throw new Error('Role already in used')

  await repo(trx).softDelete(id)

  return data
}

export default {
  getListPaginate,
  findById,
  findByIdWithDeleted,
  findByCode,
  findByCodeWithDeleted,
  findByName,
  findByNameWithDeleted,
  create,
  deleteById,
}