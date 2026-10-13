import { Request, Response } from 'express'

import { response } from '~/helpers/responseHelper'

import userService from '~/services/v1/userService'

export default {
  getList: async (req: Request, res: Response) => {
    const data = await userService.getList(req)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  create: async (req: Request, res: Response) => {
    const data = await userService.create(req.body)

    return response(res, {
      status: 201,
      data,
      message: 'Success',
    })
  },

  getDetail: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const data = await userService.getDetail(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  getByStatus: async (req: Request, res: Response) => {
    const data = await userService.getByStatus(1)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  update: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const paylaod = req.body
    const data = await userService.update(id, paylaod)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  changeStatus: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const paylaod = req.body
    const data = await userService.changeStatus(id, paylaod)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  resetPassword: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const data = await userService.resetPassword(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  delete: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const data = await userService.delete(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  },

  permanentDelete: async (req: Request, res: Response) => {
    const id = String(req.params?.id)
    const data = await userService.permanentDelete(id)

    return response(res, {
      status: 200,
      data,
      message: 'Success',
    })
  }
}