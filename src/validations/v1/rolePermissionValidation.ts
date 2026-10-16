import { z } from "zod"

export type TDetailRolePermissionParams = z.infer<typeof detailRolePermissionSchema>
export type TUdpateRolePermissionBody = z.infer<typeof udpateRolePermissionSchema>

const detailRolePermissionSchema = z.object({
  roleId: z.uuid('Role is must be a valid UUID')
})

const udpateRolePermissionSchema = z.object({
  access: z.array(
    z.object({
      featureId: z.uuid('Feature id mst be a valid UUID'),

      featureActionId: z.uuid('Feature action id mus be a valid UUID'),

      isActive: z.boolean().default(true),
    })
  )
})

export default {
  detailRolePermissionSchema,
  udpateRolePermissionSchema,
}