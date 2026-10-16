import { response } from '~/helpers/responseHelper'

import featureService from '~/services/v1/featureService'

import { TCreateFeatureBody, TUpdateFeatureBody } from '~/validations/v1/featureValidation'

export default {
  getList: async (req: Req, res: Res) => {
    const data = await featureService.getList(req)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  create: async (req: Req, res: Res) => {
    const payload: TCreateFeatureBody = req.body

    const data = await featureService.create(payload)

    return response(res, {
      status: 201,
      data,
      message: 'Success',
    })
  },

  getDetail: async (req: Req, res: Res) => {
    const id: string = String(req.params.id)

    const data = await featureService.getDetail(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  update: async (req: Req, res: Res) => {
    const id: string = String(req.params.id)
    const payload: TUpdateFeatureBody = req.body

    const data = await featureService.update(id, payload)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  delete: async (req: Req, res: Res) => {
    const id: string = String(req.params.id)

    const data = await featureService.delete(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },
}