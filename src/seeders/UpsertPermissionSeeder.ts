import { AppDataSource } from '~/configs/dataSource'
import { FeatureAction } from '~/entities/featureActionEntity'
import repository from '~/repositories'

export type TPermissionSeed = {
  code: string
  name: string
  isActive?: boolean
}

export const permissions: TPermissionSeed[] = [
  {
    code: 'index',
    name: 'List Data'
  },
  {
    code: 'create',
    name: 'Create Data'
  },
  {
    code: 'view',
    name: 'View Data'
  },
  {
    code: 'edit',
    name: 'Edit Data'
  },
  {
    code: 'update',
    name: 'Update Data'
  },
  {
    code: 'delete',
    name: 'Delete Data'
  }
]

export const upsertPermissionSeeder = async () => {
  return await AppDataSource.transaction(async (trx) => {
    for (const item of permissions) {
      console.log('----------------------------------------------')
      console.log('FINDING permission ', item?.code)
      const existing = await repository.findBy(FeatureAction, { field: 'code', value: item.code, withDeleted: true }, trx)
      if (existing) {
        console.log('Permission found')
        console.log('UPDATING exisiting permission')
        await repository.updateBy(FeatureAction, { field: 'code', value: item.code }, { name: item.name, isActive: item.isActive }, trx)
        console.log('UPDATED.....')
      } else {
        console.log('Permission not found')
        console.log('CREATING new permission')
        await repository.create(FeatureAction, { ...item, isActive: true }, trx)
        console.log('CREATED.....')
      }
    }
  })
}

export default upsertPermissionSeeder