type TRolePermissionItem = {
  id: string
  roleId: string
  featurePermissionId: string
  isActive: boolean
  featurePermission: {
    id: string
    featureId: string
    featureActionId: string
    isActive: boolean
    feature: {
      code: string
      name: string
      isActive: boolean
    }
    featureAction: {
      code: string
      name: string
      isActive: boolean
    }
  }
}

export type TGroupedRolePermission = {
  featureId: string
  code: string
  name: string
  isActive: boolean
  actions: {
    featureActionId: string
    code: string
    name: string
    isActive: boolean
  }[]
}

export const groupRolePermissions = (
  data: TRolePermissionItem[]
): TGroupedRolePermission[] => {
  const features = new Map<string, TGroupedRolePermission>()

  for (const item of data) {
    const { featurePermission } = item
    const { feature, featureAction } = featurePermission

    if (!features.has(featurePermission.featureId)) {
      features.set(featurePermission.featureId, {
        featureId: featurePermission.featureId,
        code: feature.code,
        name: feature.name,
        isActive: feature.isActive,
        actions: []
      })
    }

    features.get(featurePermission.featureId)!.actions.push({
      featureActionId: featurePermission.featureActionId,
      code: featureAction.code,
      name: featureAction.name,
      isActive:
        item.isActive &&
        featurePermission.isActive &&
        featureAction.isActive
    })
  }

  return Array.from(features.values())
}