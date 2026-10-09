import { Request, Response } from 'express'

import { response } from '~/helpers/responseHelper'

import userService from '~/services/v1/userService'

export default {
  create: async (req: Request, res: Response) => {
    const data = await userService.create(req.body)

    return response(res, {
      status: 201,
      data,
      message: 'Success',
    })
  },

  getDetail: async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await userService.getDetail(id as string)

    return response(res, {
      status: 201,
      data,
      message: 'Success',
    })
  }
}