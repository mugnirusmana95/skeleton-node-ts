import { z } from 'zod'

import { allowedLimit, orderByRegex, allowedStatusDelete } from '~/helpers/paramHelper'

import roleRepository from '~/repositories/v1/roleRepository'

export const listRoleSchema = z.object({
  page: z.coerce
    .number({ message: 'Page must be a number' })
    .int('Page must be an integer')
    .min(1, 'Page minimum 1'),

  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .int('Limit delete must be an integer')
    .refine(
      (val) => (allowedLimit as number[]).includes(val),
      { message: `Limit must be one of: ${allowedLimit.join(', ')}` },
    ),

  search: z.string().optional(),

  orderBy: z
    .string()
    .regex(orderByRegex, 'Invalid orderBy format. Example: name,ASC|createdAt,DESC')
    .optional(),

  statusDelete: z.coerce
    .number({ message: 'Status delete must be a number' })
    .int('Status delete must be an integer')
    .refine(
      (val) => (allowedStatusDelete as number[]).includes(val),
      { message: `Status delete must be one of: ${allowedStatusDelete.join(', ')}` },
    )
    .optional(),
})

export type TListRoleQuery = z.infer<typeof listRoleSchema>

export const createRoleSchema = z.object({
  code: z
    .string({ message: 'Code is required' })
    .min(1, 'Code is required')
    .max(50, 'Code maximum 50 characters')
    .refine(
      async (code) => {
        const data = await roleRepository.findByCodeWithDeleted(code)
        return !data
      },
      { message: 'Code already exist' },
    ),

  name: z
    .string({ message: 'Name is required' })
    .min(1, 'Name is required')
    .max(100, 'Name maximum 100 characters')
    .refine(
      async (name) => {
        const data = await roleRepository.findByNameWithDeleted(name)
        return !data
      },
      { message: 'Name already exist' },
    ),

  isActive: z.boolean().optional().default(true),
})

export type TCreateRoleBody = z.infer<typeof createRoleSchema>

export const detailRoleSchema = z.object({
  id: z.uuid({
    message: 'Id must be a valid UUID',
    version: 'v4'
  }),
})

export type TDetailRoleQuery = z.infer<typeof detailRoleSchema>
