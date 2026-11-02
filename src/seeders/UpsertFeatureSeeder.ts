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
  }
]

export const upsertFeatureSeeder = async () => {
  return await AppDataSource.transaction(async (trx) => {
    for (const item of features) {
      console.log('----------------------------------------------')
      console.log('FINDING feature ', item?.code)
      const result = await repository.findBy(Feature, { field: 'code', value: item.code, withDeleted: true }, trx)
      if (result) {
        console.log('Feature found')
        console.log('UPDATING exisiting feature')
        await repository.updateBy(Feature, { field: 'code', value: item.code }, { name: item.name }, trx)
        console.log('UPDATED.....')
      } else {
        console.log('Feature not found')
        console.log('CREATING new feature')
        await repository.create(Feature, { ...item, isActive: true }, trx)
        console.log('CREATED.....')
      }
    }
  })
}

export default upsertFeatureSeeder