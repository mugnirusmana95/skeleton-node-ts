import { EntityManager } from 'typeorm'

import { AppDataSource } from '~/configs/dataSource'

import { User, EUserStatusEntity } from '~/entities/userEntity'

const repo = (manager?: EntityManager) =>
  (manager ?? AppDataSource).getRepository(User)

const findById = (id: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('user.id = :id', { id })
    .getOne()

const findByIdWithDeleted = (id: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .withDeleted()
    .where('user.id = :id', { id })
    .getOne()

const findByEmail = (email: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('user.email = :email', { email })
    .getOne()

const findByEmailWithDeleted = (email: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .withDeleted()
    .where('user.email = :email', { email })
    .getOne()

const getByRoleId = (roleId: string, trx?: EntityManager) =>
  repo(trx)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .withDeleted()
    .where('user.roleId = :roleId', { roleId })
    .getMany()

const create = async (
  data: {
    email: string
    password: string
    roleId: string
    status?: EUserStatusEntity
  },
  trx?: EntityManager
) => {
  const payload = {
    ...data,
    status: data.status ?? EUserStatusEntity.ACTIVE,
  }

  const save = await repo(trx).save(payload)

  return await findById(save.id, trx)
}

const deleteById = async (id: string, trx?: EntityManager) => {
  const data = await findById(id, trx)
  if (!data) throw new Error('User not found')

  await repo(trx).softDelete(data.id)
  return data
}

export default {
  findById,
  findByIdWithDeleted,
  findByEmail,
  findByEmailWithDeleted,
  getByRoleId,
  create,
  deleteById,
}
