import { Request, Response } from 'express'

import { response } from '~/helpers/responseHelper'

import roleService from '~/services/v1/roleService'

export default {
  getList: async (req: Request, res: Response) => {
    const data = await roleService.getList(req)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  create: async (req: Request, res: Response) => {
    const data = await roleService.create(req.body)

    return response(res, {
      status: 201,
      data,
      message: 'Success',
    })
  },

  getDetail: async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await roleService.getDetail(id as string)
    return response(res, {
      status: 200,
      data: data,
      message: 'Success',
    })
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await roleService.delete(id as string)
    return response(res, {
      status: 200,
      data: data,
      message: 'Success',
    })
  }
}