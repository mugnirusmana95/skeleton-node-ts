import { AppDataSource } from '~/configs/dataSource'
import { NotFound } from '~/helpers/exceptionHelper'

import { parseParams } from '~/helpers/paramHelper'
import { TResGetListPaginateFeatureAction } from '~/repositories/v1/featureActionRepository'

import featureRepository, { TResFindFeature, TResGetListPaginateFeature } from '~/repositories/v1/featureRepository'

import { TCreateFeatureBody, TUpdateFeatureBody } from '~/validations/v1/featureValidation'

export default {
  getList: async (req: Req): TResGetListPaginateFeature => {
    const params = parseParams(req)
    const data = await featureRepository.getListPaginate(params)
    return data
  },

  create: async (payload: TCreateFeatureBody): TResFindFeature => {
    return await AppDataSource.transaction(async (trx) => {
      const { code, name, isActive } = payload

      const data = await featureRepository.create({
        code,
        name,
        isActive
      }, trx)

      return await featureRepository.findBy({
        field: 'id',
        value: data.id
      }, trx)
    })
  },

  getDetail: async (id: string): TResFindFeature => {
    const data = await featureRepository.findBy({
      field: 'id',
      value: id,
    })

    if (!data) throw new NotFound('Feature not found')

    return data
  },

  update: async (id: string, payload: TUpdateFeatureBody): TResFindFeature => {
    return await AppDataSource.transaction(async (trx) => {
      const { code, name, isActive } = payload
      const data = await featureRepository.findBy({
        field: 'id',
        value: id,
        withSelect: ['feature.id']
      }, trx)
      if (!data) throw new NotFound('Feature not found')

      await featureRepository.updateBy(
        { field: 'id', value: id },
        { code, name, isActive },
        trx
      )

      return await featureRepository.findBy({
        field: 'id',
        value: data.id,
      }, trx)
    })
  },

  delete: async (id: string): TResFindFeature => {
    return await AppDataSource.transaction(async (trx) => {
      const data = await featureRepository.findBy({
        field: 'id',
        value: id,
      }, trx)
      if (!data) throw new NotFound('Feature not found')

      await featureRepository.deleteBy(
        { field: 'id', value: id },
        trx
      )

      return data
    })
  },
}