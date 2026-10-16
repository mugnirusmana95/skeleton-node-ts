import { z } from 'zod'

import { orderByRegex, EStatusDelete, allowedTextStatusDelete, ALLOWED_LIMITS } from '~/helpers/paramHelper'

import roleRepository from '~/repositories/v1/roleRepository'

export type TListRoleQuery = z.infer<typeof listRoleSchema>
export type TCreateRoleBody = z.infer<typeof createRoleSchema>
export type TDetailRoleQuery = z.infer<typeof detailRoleSchema>
export type TUpdateRoleBody = z.infer<typeof updateRoleSchema>
export type TActivationRoleBody = z.infer<typeof activationRoleSchema>

const listRoleSchema = z.object({
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

const createRoleSchema = z.object({
  code: z
    .string('Code is required')
    .min(1, 'Code is required')
    .max(50, 'Code maximum 50 characters'),

  name: z
    .string('Name is required')
    .min(1, 'Name is required')
    .max(100, 'Name maximum 100 characters'),

  isActive: z.boolean().optional().default(true),
}).superRefine(async (data, ctx) => {
  const { code, name } = data

  const existingCode = await roleRepository.findBy({
    field: 'code',
    value: code,
    withDeleted: true
  })
  if (existingCode) {
    ctx.addIssue({
      code: 'custom',
      path: ['code'],
      message: 'Code already exist',
    })
  }

  const existingName = await roleRepository.findBy({
    field: 'name',
    value: name,
    withDeleted: true
  })
  if (existingName) {
    ctx.addIssue({
      code: 'custom',
      path: ['name'],
      message: 'Name already exist',
    })
  }
})

const detailRoleSchema = z.object({
  id: z.uuidv4('Id must be a valid UUID'),
})

const updateRoleSchema = z.object({
  id: z.uuidv4('Id must be a valid UUID'),

  code: z
    .string('Code is required')
    .min(1, 'Code is required')
    .max(50, 'Code maximum 50 characters'),

  name: z
    .string('Name is required')
    .min(1, 'Name is required')
    .max(100, 'Name maximum 100 characters'),

}).superRefine(async (data, ctx) => {
  const { id, code, name } = data

  const existingCode = await roleRepository.findByExceptBy(
    { field: 'code', value: code, withDeleted: true },
    { field: 'id', value: id }
  )

  if (existingCode) {
    ctx.addIssue({
      code: 'custom',
      path: ['code'],
      message: 'Code already exist',
    })
  }

  const existingName = await roleRepository.findByExceptBy(
    { field: 'name', value: name, withDeleted: true },
    { field: 'id', value: id }
  )

  if (existingName) {
    ctx.addIssue({
      code: 'custom',
      path: ['name'],
      message: 'Name already exist',
    })
  }
})

const activationRoleSchema = z.object({
  id: z.uuidv4('Id must be a valid UUID'),

  isActive: z.boolean('Is active must be a boolean value (true / false)')

}).superRefine(async (data, ctx) => {
  const { id, isActive } = data
  if (!isActive && isActive !== false) {
    ctx.addIssue({
      code: 'custom',
      path: ['code'],
      message: 'Is active is required',
    })
  }

  const role = await roleRepository.findBy({
    field: 'id',
    value: id
  })
  if (role && role.isActive === isActive) {
    const currentMessage = role.isActive ? 'active' : 'inactive'
    ctx.addIssue({
      code: 'custom',
      path: ['name'],
      message: `Is active already ${currentMessage}`,
    })
  }
})

export default {
  listRoleSchema,
  createRoleSchema,
  detailRoleSchema,
  updateRoleSchema,
  activationRoleSchema,
}