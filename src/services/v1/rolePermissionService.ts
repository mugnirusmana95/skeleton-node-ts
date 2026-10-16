import { AppDataSource } from "~/configs/dataSource";

import { NotFound } from "~/helpers/exceptionHelper";
import { groupRolePermissions, TGroupedRolePermission } from "~/helpers/groupRolePermissionHelper";

import featurePermissionRepository from "~/repositories/v1/featurePermissionRepository";
import rolePermissionRepository, { TResGetRolePermission } from "~/repositories/v1/rolePermissionRepository";
import roleRepository from "~/repositories/v1/roleRepository";

import { TUdpateRolePermissionBody } from "~/validations/v1/rolePermissionValidation";

export default {
  getList: async (roleId: string) => {
    const data = await rolePermissionRepository.getBy({
      field: 'roleId',
      value: roleId,
      withRelation: [
        { relation: 'rolePermission.role', alias: 'role' },
        { relation: 'rolePermission.featurePermission', alias: 'featurePermission' },
        { relation: 'featurePermission.feature', alias: 'feature' },
        { relation: 'featurePermission.featureAction', alias: 'featureAction' },
      ],
    })

    return groupRolePermissions(data)
  },

  update: async (roleId: string, payload: TUdpateRolePermissionBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const { access } = payload
      const role = await roleRepository.findBy({
        field: 'id',
        value: roleId
      }, trx)
      if (!role) throw new NotFound('Role not found')

      for (const item of access) {
        const { featureId, featureActionId, isActive } = item
        const featurePermission = await featurePermissionRepository.find(
          {
            where: {
              condition: `
              featurePermission.featureId = :featureId AND
              featurePermission.featureActionId = :featureActionId
            `,
              value: { featureId, featureActionId }
            },
            withSelect: ['featurePermission.id'],
            withDeleted: true
          },
          trx
        )

        if (!featurePermission) {
          const result = await featurePermissionRepository.create({
            featureId,
            featureActionId,
            isActive: true
          }, trx)

          await rolePermissionRepository.create({
            roleId,
            featurePermissionId: result.id,
            isActive
          }, trx)
        } else {
          const rolePermission = await rolePermissionRepository.find(
            {
              where: {
                condition: `
                  rolePermission.roleId = :roleId AND
                  rolePermission.featurePermissionId = :featurePermissionId
                `,
                value: {
                  roleId,
                  featurePermissionId: featurePermission.id
                }
              },
              withSelect: ['rolePermission.id'],
              withDeleted: true
            },
            trx
          )

          if (!rolePermission) {
            await rolePermissionRepository.create({
              roleId: role.id,
              featurePermissionId: featurePermission.id,
              isActive
            }, trx)
          } else {
            await rolePermissionRepository.updateBy(
              {
                field: 'id',
                value: rolePermission.id
              },
              { isActive: isActive },
              trx
            )
          }
        }
      }

      const data = await rolePermissionRepository.getBy({
        field: 'roleId',
        value: roleId,
        withRelation: [
          { relation: 'rolePermission.role', alias: 'role' },
          { relation: 'rolePermission.featurePermission', alias: 'featurePermission' },
          { relation: 'featurePermission.feature', alias: 'feature' },
          { relation: 'featurePermission.featureAction', alias: 'featureAction' },
        ],
      }, trx)

      return groupRolePermissions(data)
    })
  }
}