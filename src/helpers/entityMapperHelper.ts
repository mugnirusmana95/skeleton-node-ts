type TMapperOptions = {
  withDeleted?: boolean
}

export const entityMapper = <T>(
  entity: T,
  options: TMapperOptions = {},
): T => {
  if (entity === null || entity === undefined) {
    return entity
  }

  if (Array.isArray(entity)) {
    return entity.map((item) => entityMapper(item, options)) as T
  }

  if (entity instanceof Date || typeof entity !== 'object') {
    return entity
  }

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(entity)) {
    if (!options.withDeleted && ['isDeleted', 'deletedAt'].includes(key)) {
      continue
    }

    result[key] = entityMapper(value, options)
  }

  return result as T
}