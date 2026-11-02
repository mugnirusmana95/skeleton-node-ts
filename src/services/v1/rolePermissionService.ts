import { AppDataSource } from "~/configs/dataSource";
import { NotFound } from "~/helpers/exceptionHelper";
import { groupRolePermissions } from "~/helpers/groupRolePermissionHelper";
import repository from "~/repositories";
import { Role } from "~/entities/roleEntity";
import { FeaturePermission } from "~/entities/featurePermissionEntity";
import { RolePermission } from "~/entities/rolePermissionEntity";
import { TUdpateRolePermissionBody } from "~/validations/v1/rolePermissionValidation";

export default {
  getList: async (roleId: string) => {
    const data = await repository.getBy(RolePermission, {
      field: 'roleId',
      value: roleId,
      withRelation: [
        { relation: 'rolePermission.role', alias: 'role' },
        { relation: 'rolePermission.featurePermission', alias: 'featurePermission' },
        { relation: 'featurePermission.feature', alias: 'feature' },
        { relation: 'featurePermission.featureAction', alias: 'featureAction' },
      ],
    })

    return groupRolePermissions(data as any)
  },

  update: async (roleId: string, payload: TUdpateRolePermissionBody) => {
    return await AppDataSource.transaction(async (trx) => {
      const { access } = payload
      const role = await repository.findBy(Role, {
        field: 'id',
        value: roleId
      }, trx)
      if (!role) throw new NotFound('Role not found')

      for (const item of access) {
        const { featureId, featureActionId, isActive } = item
        const featurePermission = await repository.find(
          FeaturePermission,
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
          const result = await repository.create(FeaturePermission, {
            featureId,
            featureActionId,
            isActive: true
          }, trx)

          await repository.create(RolePermission, {
            roleId,
            featurePermissionId: result.id,
            isActive
          }, trx)
        } else {
          const rolePermission = await repository.find(
            RolePermission,
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
            await repository.create(RolePermission, {
              roleId: role.id,
              featurePermissionId: featurePermission.id,
              isActive
            }, trx)
          } else {
            await repository.updateBy(
              RolePermission,
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

      const data = await repository.getBy(RolePermission, {
        field: 'roleId',
        value: roleId,
        withRelation: [
          { relation: 'rolePermission.role', alias: 'role' },
          { relation: 'rolePermission.featurePermission', alias: 'featurePermission' },
          { relation: 'featurePermission.feature', alias: 'feature' },
          { relation: 'featurePermission.featureAction', alias: 'featureAction' },
        ],
      }, trx)

      return groupRolePermissions(data as any)
    })
  }
}