import { AppDataSource } from '~/configs/dataSource'
import { Feature } from '~/entities/featureEntity'

import repository from '~/repositories'

import dataFeatures from '~/seeders/data/features.json'

export type TFeatureSeed = {
  code: string
  name: string
}

export const features: TFeatureSeed[] = dataFeatures

export const insertFeatureSeeder = async () => {
  return await AppDataSource.transaction(async (trx) => {
    const totalFeature = await repository.count(Feature, { withDeleted: true }, trx)
    if (totalFeature >= dataFeatures.length) {
      console.log(`${totalFeature} Features already seeded, skipped...`)
    } else {
      for (const item of features) {
        console.log('----------------------------------------------')
        console.log('FINDING feature ', item?.code)
        const result = await repository.findBy(Feature, { field: 'code', value: item.code, withDeleted: true }, trx)
        if (!result) {
          console.log('Feature not found')
          console.log('CREATING new feature')
          await repository.create(Feature, { ...item, isActive: true }, trx)
          console.log('CREATED.....')
        } else {
          console.log('Feature found, skipped...')
        }
      }
    }
  })
}