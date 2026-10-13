import { Request, Response } from 'express'

import { response } from '~/helpers/responseHelper'

import profileService from '~/services/v1/profileService'

export default {
  getDetail: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const data = await profileService.getDetail(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  update: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const paylaod = req.body
    const data = await profileService.update(id, paylaod)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },
}