import { AppDataSource } from '~/configs/dataSource'
import { FeatureAction } from '~/entities/featureActionEntity'

import repository from '~/repositories'

import dataPermission from '~/seeders/data/permissions.json'

export type TPermissionSeed = {
  code: string
  name: string
  isActive?: boolean
}

export const permissions = dataPermission as TPermissionSeed[]

export const insertPermissionSeeder = async () => {
  return await AppDataSource.transaction(async (trx) => {
    const totalPermission = await repository.count(FeatureAction, { withDeleted: true }, trx)
    if (totalPermission >= permissions.length) {
      console.log(`${totalPermission} Permissions already seeded, skipped...`)
    } else {
      for (const item of permissions) {
        console.log('----------------------------------------------')
        console.log('FINDING permission ', item?.code)
        const existing = await repository.findBy(FeatureAction, { field: 'code', value: item.code, withDeleted: true }, trx)
        if (!existing) {
          console.log('Permission not found')
          console.log('CREATING new permission')
          await repository.create(FeatureAction, { ...item, isActive: true }, trx)
          console.log('CREATED.....')
        } else {
          console.log('Permission found, skipped')
        }
      }
    }
  })
}