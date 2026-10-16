
import { Forbidden, InternalServer, Unauthorized } from '~/helpers/exceptionHelper'
import userRepository from '~/repositories/v1/userRepository'
import rolePermissionRepository from '~/repositories/v1/rolePermissionRepository'

type PermissionType = 'permission' | 'role'

export const permissionMiddleware = (
  permissionValue: string | string[],
  type: PermissionType = 'permission'
) => {
  return async (req: Req, res: Res, next: Next) => {
    const authorization = req.cookies.token

    if (!authorization || !req.auth?.userId) throw new Unauthorized('Authentication is required. Please login first.')

    const user = await userRepository.findBy({
      field: 'id',
      value: String(req.auth.userId),
      withRelation: [
        { relation: 'user.role', alias: 'role' }
      ]
    })

    if (!user || !user.role) throw new Unauthorized('Authentication is required. Please login first.')

    //bypass if superadmin
    if (user?.role?.code === 'su') {
      return next()
    }
    //bypass if superadmin

    const values = Array.isArray(permissionValue)
      ? permissionValue
      : [permissionValue]

    if (values.length === 0 || values.some((value) => !value.trim())) {
      throw new Forbidden('Invalid permission value.')
    }

    //permission check by role
    if (type === 'role') {
      if (!values.includes(user.role.code)) throw new Forbidden('You are not authorized to perform this action.')

      return next()
    }
    //permission check by role

    //permission check by permission action
    const permissions = values.map((value) => {
      const [featureRequired, actionRequired, ...extra] = value.split('.')

      if (!featureRequired || !actionRequired || extra.length > 0) throw new InternalServer('Invalid permission format.')

      return { featureRequired, actionRequired }
    })

    const permissionResults = await Promise.all(
      permissions.map(({ featureRequired, actionRequired }) =>
        rolePermissionRepository.find({
          where: {
            condition: `
              rolePermission.roleId = :roleIdRequired AND
              feature.code = :featureRequired AND
              featureAction.code = :actionRequired AND
              featurePermission.isActive = :isActiveRequired
            `,
            value: {
              roleIdRequired: user.role.id,
              featureRequired,
              actionRequired,
              isActiveRequired: true
            }
          },
          withRelation: [
            {
              relation: 'rolePermission.featurePermission',
              alias: 'featurePermission'
            },
            {
              relation: 'featurePermission.feature',
              alias: 'feature'
            },
            {
              relation: 'featurePermission.featureAction',
              alias: 'featureAction'
            }
          ]
        })
      )
    )

    if (!permissionResults.some(Boolean)) throw new Forbidden('You are not authorized to perform this action.')
    //permission check by permission action

    return next()
  }
}
