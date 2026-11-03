import { AppDataSource } from '~/configs/dataSource'
import { NotFound } from '~/helpers/exceptionHelper'
import { parseParams } from '~/helpers/paramHelper'
import repository, { TResGetListPaginate } from '~/repositories'
import { FeatureAction } from '~/entities/featureActionEntity'
import { TCreateFeatureActionBody, TUpdateFeatureActionBody } from '~/validations/v1/featureActionValidation'

export default {
  getList: async (req: Req): TResGetListPaginate<FeatureAction> => {
    const params = parseParams(req)
    return await repository.getListPaginate(FeatureAction, params)
  },

  create: async (payload: TCreateFeatureActionBody): Promise<FeatureAction | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const { code, name, isActive } = payload

      const data = await repository.create(FeatureAction, {
        code,
        name,
        isActive
      }, trx)

      return await repository.findBy(FeatureAction, {
        field: 'id',
        value: data.id
      }, trx)
    })
  },

  getDetail: async (id: string): Promise<FeatureAction | null> => {
    const data = await repository.findBy(FeatureAction, {
      field: 'id',
      value: id,
    })

    if (!data) throw new NotFound('Feature action not found')

    return data
  },

  update: async (id: string, payload: TUpdateFeatureActionBody): Promise<FeatureAction | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const { code, name, isActive } = payload
      const data = await repository.findBy(FeatureAction, {
        field: 'id',
        value: id,
        withSelect: ['featureAction.id']
      }, trx)
      if (!data) throw new NotFound('Feature action not found')

      await repository.updateBy(
        FeatureAction,
        { field: 'id', value: id },
        { code, name, isActive },
        trx
      )

      return await repository.findBy(FeatureAction, {
        field: 'id',
        value: data.id,
      }, trx)
    })
  },

  delete: async (id: string): Promise<FeatureAction | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const data = await repository.findBy(FeatureAction, {
        field: 'id',
        value: id,
      }, trx)
      if (!data) throw new NotFound('Feature action not found')

      await repository.deleteBy(
        FeatureAction,
        { field: 'id', value: id },
        trx
      )

      return data
    })
  },
}