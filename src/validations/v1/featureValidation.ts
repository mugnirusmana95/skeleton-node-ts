import { z } from 'zod'

import { orderByRegex, EStatusDelete, allowedTextStatusDelete, ALLOWED_LIMITS } from '~/helpers/paramHelper'

import featureRepository from '~/repositories/v1/featureRepository'

export type TListFeatureQuery = z.infer<typeof listFeatureSchema>
export type TCreateFeatureBody = z.infer<typeof createFeatureSchema>
export type TDetailFeatureParams = z.infer<typeof detailFeatureSchema>
export type TUpdateFeatureBody = z.infer<typeof updateFeatureSchema>

const listFeatureSchema = z.object({
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

const createFeatureSchema = z.object({
  code: z
    .string('Code is required')
    .min(1, 'Code minimum 1'),

  name: z
    .string('Name is required')
    .min(1, 'Name minimum 1'),

  isActive: z.boolean().optional().default(true),
}).superRefine(async (data, ctx) => {
  const { code, name } = data

  const codeExist = await featureRepository.findBy({
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

  const nameExist = await featureRepository.findBy({
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

const detailFeatureSchema = z.object({
  id: z.uuidv4('Id must be a valid UUID')
})

const updateFeatureSchema = z.object({
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

  const codeExist = await featureRepository.findByExceptBy(
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

  const nameExist = await featureRepository.findByExceptBy(
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
  listFeatureSchema,
  createFeatureSchema,
  detailFeatureSchema,
  updateFeatureSchema,
}