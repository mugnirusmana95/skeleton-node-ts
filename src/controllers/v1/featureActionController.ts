import { response } from '~/helpers/responseHelper'

import featureActionService from '~/services/v1/featureActionService'

import { TCreateFeatureActionBody, TUpdateFeatureActionBody } from '~/validations/v1/featureActionValidation'

export default {
  getList: async (req: Req, res: Res) => {
    const data = await featureActionService.getList(req)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  create: async (req: Req, res: Res) => {
    const payload: TCreateFeatureActionBody = req.body

    const data = await featureActionService.create(payload)

    return response(res, {
      status: 201,
      data,
      message: 'Success',
    })
  },

  getDetail: async (req: Req, res: Res) => {
    const id = String(req.params.id)

    const data = await featureActionService.getDetail(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  update: async (req: Req, res: Res) => {
    const id = String(req.params.id)
    const payload: TUpdateFeatureActionBody = req.body

    const data = await featureActionService.update(id, payload)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  delete: async (req: Req, res: Res) => {
    const id = String(req.params.id)

    const data = await featureActionService.delete(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },
}