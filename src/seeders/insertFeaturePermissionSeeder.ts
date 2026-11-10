import { AppDataSource } from '~/configs/dataSource'
import { features } from '~/seeders/insertFeatureSeeder'
import { permissions } from '~/seeders/insertPermissionSeeder'
import { Feature } from '~/entities/featureEntity'
import { FeatureAction } from '~/entities/featureActionEntity'
import { FeaturePermission } from '~/entities/featurePermissionEntity'
import repository from '~/repositories'

export type TFeaturePermissionSeed = {
  featureCode: string
  featureId?: string
  permissionCode: string
  permissionId?: string
  isActive: boolean
}

const mergeFeaturePermission = async (): Promise<TFeaturePermissionSeed[]> => {
  const result: TFeaturePermissionSeed[] = []
  for (const feature of features) {
    const featureId = await repository.findBy(Feature, { field: 'code', value: feature.code })
    for (const permission of permissions) {
      const permissionId = await repository.findBy(FeatureAction, { field: 'code', value: permission.code })
      result.push({
        featureCode: feature.code,
        featureId: featureId?.id,
        permissionCode: permission.code,
        permissionId: permissionId?.id,
        isActive: true
      })
    }
  }
  return result
}

export const insertFeaturePermissionSeeder = async () => {
  return AppDataSource.transaction(async (trx) => {
    const data = await mergeFeaturePermission()
    for (const item of data) {
      console.log('----------------------------------------------')
      const { featureCode, featureId, permissionCode, permissionId, isActive } = item
      console.log('FINDING Feature Permission ', featureCode, permissionCode)
      if (!featureId || !permissionId) {
        if (!featureId && permissionId) {
          console.log('Feature not found, skipped...')
        } else if (featureId && !permissionId) {
          console.log('Permission not found, skipped...')
        } else if (!featureId && !permissionId) {
          console.log('Feature and Permission not found, skipped...')
        }
        continue
      }

      console.log('FINDING Feature Access Feature Permission')
      const result = await repository.find(FeaturePermission, {
        where: {
          condition: 'featurePermission.featureId = :featureId AND featurePermission.featureActionId = :permissionId',
          value: { featureId, permissionId },
        },
        withDeleted: true,
      }, trx)

      if (!result) {
        console.log('Feature Access not found')
        console.log('CREATING Feature Access')
        await repository.create(FeaturePermission, {
          featureActionId: permissionId,
          featureId: featureId,
          isActive,
        }, trx)
        console.log('CREATED Feature Access.....')
      } else {
        console.log('Feature Access found, skipped...')
      }
    }
  })
}