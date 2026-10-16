import { AppDataSource } from '~/configs/dataSource'
import { NotFound } from '~/helpers/exceptionHelper'

import { parseParams } from '~/helpers/paramHelper'

import featureActionRepository, { TResFindFeatureAction, TResGetListPaginateFeatureAction } from '~/repositories/v1/featureActionRepository'

import { TCreateFeatureActionBody, TUpdateFeatureActionBody } from '~/validations/v1/featureActionValidation'

export default {
  getList: async (req: Req): TResGetListPaginateFeatureAction => {
    const params = parseParams(req)
    const data = await featureActionRepository.getListPaginate(params)
    return data
  },

  create: async (payload: TCreateFeatureActionBody): TResFindFeatureAction => {
    return await AppDataSource.transaction(async (trx) => {
      const { code, name, isActive } = payload

      const data = await featureActionRepository.create({
        code,
        name,
        isActive
      }, trx)

      return await featureActionRepository.findBy({
        field: 'id',
        value: data.id
      }, trx)
    })
  },

  getDetail: async (id: string): TResFindFeatureAction => {
    const data = await featureActionRepository.findBy({
      field: 'id',
      value: id,
    })

    if (!data) throw new NotFound('Feature action not found')

    return data
  },

  update: async (id: string, payload: TUpdateFeatureActionBody): TResFindFeatureAction => {
    return await AppDataSource.transaction(async (trx) => {
      const { code, name, isActive } = payload
      const data = await featureActionRepository.findBy({
        field: 'id',
        value: id,
        withSelect: ['featureAction.id']
      }, trx)
      if (!data) throw new NotFound('Feature action not found')

      await featureActionRepository.updateBy(
        { field: 'id', value: id },
        { code, name, isActive },
        trx
      )

      return await featureActionRepository.findBy({
        field: 'id',
        value: data.id,
      }, trx)
    })
  },

  delete: async (id: string): TResFindFeatureAction => {
    return await AppDataSource.transaction(async (trx) => {
      const data = await featureActionRepository.findBy({
        field: 'id',
        value: id,
      }, trx)
      if (!data) throw new NotFound('Feature not found')

      await featureActionRepository.deleteBy(
        { field: 'id', value: id },
        trx
      )

      return data
    })
  },
}