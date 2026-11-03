import { AppDataSource } from '~/configs/dataSource'
import { NotFound } from '~/helpers/exceptionHelper'
import { parseParams } from '~/helpers/paramHelper'
import repository, { TResGetListPaginate } from '~/repositories'
import { Feature } from '~/entities/featureEntity'
import { TCreateFeatureBody, TUpdateFeatureBody } from '~/validations/v1/featureValidation'

export default {
  getList: async (req: Req): TResGetListPaginate<Feature> => {
    const params = parseParams(req)
    return await repository.getListPaginate(Feature, params)
  },

  create: async (payload: TCreateFeatureBody): Promise<Feature | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const { code, name, isActive } = payload

      const data = await repository.create(Feature, {
        code,
        name,
        isActive
      }, trx)

      return await repository.findBy(Feature, {
        field: 'id',
        value: data.id
      }, trx)
    })
  },

  getDetail: async (id: string): Promise<Feature | null> => {
    const data = await repository.findBy(Feature, {
      field: 'id',
      value: id,
    })

    if (!data) throw new NotFound('Feature not found')

    return data
  },

  update: async (id: string, payload: TUpdateFeatureBody): Promise<Feature | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const { code, name, isActive } = payload
      const data = await repository.findBy(Feature, {
        field: 'id',
        value: id,
        withSelect: ['feature.id']
      }, trx)
      if (!data) throw new NotFound('Feature not found')

      await repository.updateBy(
        Feature,
        { field: 'id', value: id },
        { code, name, isActive },
        trx
      )

      return await repository.findBy(Feature, {
        field: 'id',
        value: data.id,
      }, trx)
    })
  },

  delete: async (id: string): Promise<Feature | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const data = await repository.findBy(Feature, {
        field: 'id',
        value: id,
      }, trx)
      if (!data) throw new NotFound('Feature not found')

      await repository.deleteBy(
        Feature,
        { field: 'id', value: id },
        trx
      )

      return data
    })
  },
}