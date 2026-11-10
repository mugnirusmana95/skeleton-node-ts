import { AppDataSource } from '~/configs/dataSource'
import { Feature } from '~/entities/featureEntity'
import repository from '~/repositories'

export type TFeatureSeed = {
  code: string
  name: string
}

export const features: TFeatureSeed[] = [
  {
    code: 'role',
    name: 'Role'
  },
  {
    code: 'user',
    name: 'User'
  }
]

export const insertFeatureSeeder = async () => {
  return await AppDataSource.transaction(async (trx) => {
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
  })
}