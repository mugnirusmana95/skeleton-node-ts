import { response } from '~/helpers/responseHelper'

import rolePermissionService from '~/services/v1/rolePermissionService'
import { TDetailRolePermissionParams, TUdpateRolePermissionBody } from '~/validations/v1/rolePermissionValidation'

export default {
  getList: async (req: Req, res: Res) => {
    const roleId = String(req.params.roleId)
    const data = await rolePermissionService.getList(roleId)

    return response(res, {
      status: 200,
      data,
      message: 'Success'
    })
  },

  update: async (req: Req, res: Res) => {
    const roleId = String(req.params.roleId)
    const payload: TUdpateRolePermissionBody = req.body
    const data = await rolePermissionService.update(roleId, payload)

    return response(res, {
      status: 200,
      data,
      message: 'Success'
    })
  }
}