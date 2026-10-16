import { z } from 'zod'

import { orderByRegex, EStatusDelete, allowedTextStatusDelete, ALLOWED_LIMITS } from '~/helpers/paramHelper'

import featureActionRepository from '~/repositories/v1/featureActionRepository'

export type TListFeatureActionQuery = z.infer<typeof listFeatureActionSchema>
export type TCreateFeatureActionBody = z.infer<typeof createFeatureActionSchema>
export type TDetailFeatureActionParams = z.infer<typeof detailFeatureActionSchema>
export type TUpdateFeatureActionBody = z.infer<typeof updateFeatureActionSchema>

const listFeatureActionSchema = z.object({
  page: z.coerce
    .number('Page must be a number')
    .int('Page must be an integer')
    .min(1, 'Page minimum 1'),

  limit: z.coerce
    .number('Limit must be a number')
    .int('Limit delete must be an integer'),

  search: z.string().optional(),

  orderBy: z
    .string()
    .regex(orderByRegex, 'Order by invalid format. Example: orderBy:name,ASC or orderBy:name,ASC|createdAt,DESC')
    .optional(),

  statusDelete: z
    .preprocess(
      (val) => (val !== undefined && val !== '' ? Number(val) : EStatusDelete.NONE),
      z.enum(EStatusDelete, {
        message: `Status delete allowed value: ${allowedTextStatusDelete}`
      })
    )
    .optional(),
}).superRefine(async (data, ctx) => {
  const { limit } = data

  if (!ALLOWED_LIMITS.includes(limit as (typeof ALLOWED_LIMITS)[number])) {
    ctx.addIssue({
      code: 'custom',
      path: ['limit'],
      message: `Limit must be one of: ${ALLOWED_LIMITS.join(', ')}`,
    })
  }
})

const createFeatureActionSchema = z.object({
  code: z
    .string('Code is required')
    .min(1, 'Code minimum 1'),

  name: z
    .string('Name is required')
    .min(1, 'Name minimum 1'),

  isActive: z.boolean().optional().default(true),
}).superRefine(async (data, ctx) => {
  const { code, name } = data

  const codeExist = await featureActionRepository.findBy({
    field: 'code',
    value: code,
    withDeleted: true
  })
  if (codeExist) {
    ctx.addIssue({
      code: 'custom',
      path: ['code'],
      message: `Code already exist`,
    })
  }

  const nameExist = await featureActionRepository.findBy({
    field: 'name',
    value: name,
    withDeleted: true
  })
  if (nameExist) {
    ctx.addIssue({
      code: 'custom',
      path: ['name'],
      message: `Name already exist`,
    })
  }
})

const detailFeatureActionSchema = z.object({
  id: z.uuidv4('Id must be a valid UUID')
})

const updateFeatureActionSchema = z.object({
  id: z.uuidv4('Id must be a valid UUID'),

  code: z
    .string('Code is required')
    .min(1, 'Code minimum 1'),

  name: z
    .string('Name is required')
    .min(1, 'Name minimum 1'),

  isActive: z.boolean().optional(),
}).superRefine(async (data, ctx) => {
  const { id, code, name } = data

  const codeExist = await featureActionRepository.findByExceptBy(
    { field: 'code', value: code },
    { field: 'id', value: id },
  )

  if (codeExist) {
    ctx.addIssue({
      code: 'custom',
      path: ['code'],
      message: `Code already exist`,
    })
  }

  const nameExist = await featureActionRepository.findByExceptBy(
    { field: 'name', value: name },
    { field: 'id', value: id },
  )
  if (nameExist) {
    ctx.addIssue({
      code: 'custom',
      path: ['name'],
      message: `Name already exist`,
    })
  }
})

export default {
  listFeatureActionSchema,
  createFeatureActionSchema,
  detailFeatureActionSchema,
  updateFeatureActionSchema,
}