import { AppDataSource } from '~/configs/dataSource'
import { Role } from '~/entities/roleEntity'
import repository from '~/repositories'

export type TRoleSeed = {
  code: string
  name: string
}

export const roles: TRoleSeed[] = [
  {
    code: 'su',
    name: 'Superadmin'
  },
  {
    code: 'admin',
    name: 'Admin'
  },
  {
    code: 'staff',
    name: 'Staff'
  },
  {
    code: 'user',
    name: 'User'
  }
]

export const insertRoleSeeder = async () => {
  return await AppDataSource.transaction(async (trx) => {
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
  })
}

export default insertRoleSeeder