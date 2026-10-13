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
    const payload = req.body

    const data = await roleService.create(payload)

    return response(res, {
      status: 201,
      data,
      message: 'Success',
    })
  },

  getDetail: async (req: Request, res: Response) => {
    const id = String(req.params?.id)

    const data = await roleService.getDetail(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  update: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const payload = req.body

    const data = await roleService.update(id, payload)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  activation: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const payload = req.body

    const data = await roleService.activation(id, payload)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  delete: async (req: Request, res: Response) => {
    const id = String(req.params?.id)

    const data = await roleService.delete(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  permanentDelete: async (req: Request, res: Response) => {
    const id = String(req.params?.id)

    const data = await roleService.permanentDelete(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  }
}