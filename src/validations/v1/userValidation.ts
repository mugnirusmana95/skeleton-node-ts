import { z } from 'zod'

import { EUserStatusEntity, allowedTextUserStatusEntity } from '~/entities/userEntity'

import { ALLOWED_LIMITS, orderByRegex, allowedTextStatusDelete, EStatusDelete, TParamsLimit } from '~/helpers/paramHelper'

import roleRepository from '~/repositories/v1/roleRepository'
import userRepository from '~/repositories/v1/userRepository'

export type TListUserQuery = z.infer<typeof listUserSchema>
export type TCreateUserBody = z.infer<typeof createUserSchema>
export type TDetailUserQuery = z.infer<typeof detailUserSchema>
export type TUpdateUserBody = z.infer<typeof updateUserSchema>
export type TChangeStatusUserBody = z.infer<typeof changeStatusUserSchema>
export type TChangePasswordUserBody = z.infer<typeof changePasswordUserSchema>

const listUserSchema = z.object({
  page: z.coerce
    .number({ message: 'Page must be a number' })
    .int('Page must be an integer')
    .min(1, 'Page minimum 1'),

  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .int('Limit delete must be an integer')
    .refine(
      (val): val is NonNullable<TParamsLimit> => ALLOWED_LIMITS.includes(val as any),
      { message: `Limit must be one of: ${ALLOWED_LIMITS.join(', ')}` }
    ),

  search: z.string().optional(),

  roleId: z.string().optional(),

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
})

const createUserSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .min(1, 'Email is required')
    .max(50, 'Email maximum 50 characters'),

  roleId: z
    .string({ message: 'Role is required' })
    .min(1, 'Role is required')
    .refine(
      async (roleId) => {
        const data = await roleRepository.findBy({
          field: 'id',
          value: roleId
        })
        return data
      },
      { message: 'Role does not exist' },
    ),

  firstName: z
    .string({ message: 'First name is required' })
    .min(2, 'First name is required')
    .max(100, 'First name maximum 50 characters'),

  lastName: z
    .string({ message: 'Last name is required' })
    .min(2, 'Last name is required')
    .max(100, 'Last name maximum 50 characters')
    .optional(),

  status: z
    .enum(EUserStatusEntity, {
      message: `Status allowed value: ${allowedTextUserStatusEntity}`
    })
    .optional(),
}).superRefine(async (data, ctx) => {
  const { email, roleId } = data

  const existingEmail = await userRepository.findBy(
    { field: 'email', value: email, withDeleted: true },
  )

  if (existingEmail) {
    ctx.addIssue({
      code: 'custom',
      path: ['email'],
      message: 'Email already exist',
    })
  }

  if (roleId) {
    const existingRole = await roleRepository.findBy(
      { field: 'id', value: roleId },
    )

    if (!existingRole) {
      ctx.addIssue({
        code: 'custom',
        path: ['role'],
        message: 'Role does not exist',
      })
    }
  }
})

const detailUserSchema = z.object({
  id: z.uuidv4('Id must be a valid UUID'),
})

const updateUserSchema = z.object({
  id: z.uuidv4('Id must be a valid UUID'),

  email: z
    .string({ message: 'Email is required' })
    .min(1, 'Email is required')
    .max(50, 'Email maximum 50 characters')
    .optional(),

  roleId: z
    .uuid()
    .min(1, 'Role is required')
    .optional(),

  firstName: z
    .string({ message: 'First name is required' })
    .min(2, 'First name is required')
    .max(100, 'First name maximum 50 characters')
    .optional(),

  lastName: z
    .string({ message: 'Last name is required' })
    .min(2, 'Last name is required')
    .max(100, 'Last name maximum 50 characters')
    .optional(),
}).superRefine(async (data, ctx) => {
  const { id, email, roleId } = data

  if (email) {
    const existingEmail = await userRepository.findByExceptBy(
      { field: 'email', value: email, withDeleted: true },
      { field: 'id', value: id }
    )

    if (existingEmail) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Email already exist',
      })
    }
  }

  if (roleId) {
    const existingRole = await roleRepository.findBy(
      { field: 'id', value: roleId },
    )

    if (!existingRole) {
      ctx.addIssue({
        code: 'custom',
        path: ['role'],
        message: 'Role does not exist',
      })
    }
  }
})

const changeStatusUserSchema = z.object({
  id: z.uuidv4('Id must be a valid UUID'),

  status: z
    .enum(EUserStatusEntity, {
      message: `Status allowed value: ${allowedTextUserStatusEntity}`
    })
}).superRefine(async (data, ctx) => {
  const { id, status } = data
  if (!status && status !== false) {
    ctx.addIssue({
      code: 'custom',
      path: ['code'],
      message: 'Status is required',
    })
  }

  const user = await userRepository.findBy({
    field: 'id',
    value: id
  })
  if (user && user.status === status) {
    ctx.addIssue({
      code: 'custom',
      path: ['name'],
      message: `Status already ...`,
    })
  }
})

export default {
  listUserSchema,
  createUserSchema,
  detailUserSchema,
  updateUserSchema,
  changeStatusUserSchema,
}