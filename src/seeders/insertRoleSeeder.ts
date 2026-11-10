import { AppDataSource } from '~/configs/dataSource'
import { Role } from '~/entities/roleEntity'

import repository from '~/repositories'

import dataRoles from '~/seeders/data/roles.json'

export type TRoleSeed = {
  code: string
  name: string
}

export const roles = dataRoles as TRoleSeed[]

export const insertRoleSeeder = async () => {
  return await AppDataSource.transaction(async (trx) => {
    const totalRole = await repository.count(Role, { withDeleted: true }, trx)
    if (totalRole >= roles.length) {
      console.log(`${totalRole} Roles already seeded, skipped...`)
    } else {
      for (const item of roles) {
        console.log('----------------------------------------------')
        console.log('FINDING role ', item?.code)
        const result = await repository.findBy(Role, { field: 'code', value: item.code, withDeleted: true }, trx)
        if (!result) {
          console.log('Role not found')
          console.log('CREATING new role')
          await repository.create(Role, { ...item, isActive: true }, trx)
          console.log('CREATED.....')
        } else {
          console.log('Role found, skipped...')
        }
      }
    }
  })
}