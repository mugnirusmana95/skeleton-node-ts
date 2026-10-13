import { z } from 'zod'

import { EUserStatusEntity, allowedTextUserStatusEntity } from '~/entities/userEntity'

import { ALLOWED_LIMITS, orderByRegex, allowedTextStatusDelete, EStatusDelete, TParamsLimit } from '~/helpers/paramHelper'

import roleRepository from '~/repositories/v1/roleRepository'
import userRepository from '~/repositories/v1/userRepository'
import profileRepository from '~/repositories/v1/profileRepository'

export type TListUserQuery = z.infer<typeof listUserSchema>
export type TCreateUserBody = z.infer<typeof createUserSchema>
export type TDetailUserQuery = z.infer<typeof detailUserSchema>
export type TUpdateUserBody = z.infer<typeof updateUserSchema>
export type TChangeStatusUserBody = z.infer<typeof changeStatusUserSchema>

const listUserSchema = z.object({
  page: z.coerce
    .number({ message: 'Page must be a number' })
    .int('Page must be an integer')
    .min(1, 'Page minimum 1'),

  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .int('Limit delete must be an integer'),

  search: z.string().optional()
    .or(z.literal('')),

  roleId: z.string().optional()
    .or(z.literal('')),

  orderBy: z
    .string()
    .regex(orderByRegex, 'Order by invalid format. Example: orderBy:name,ASC or orderBy:name,ASC|createdAt,DESC')
    .optional()
    .or(z.literal('')),

  statusDelete: z
    .preprocess(
      (val) => (val !== undefined && val !== '' ? Number(val) : EStatusDelete.NONE),
      z.enum(EStatusDelete, {
        message: `Status delete allowed value: ${allowedTextStatusDelete}`
      })
    )
    .optional()
    .or(z.literal('')),
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

const createUserSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .min(1, 'Email is required')
    .max(50, 'Email maximum 50 characters'),

  roleId: z
    .string({ message: 'Role is required' })
    .min(1, 'Role is required'),

  status: z
    .enum(EUserStatusEntity, {
      message: `Status allowed value: ${allowedTextUserStatusEntity}`
    })
    .optional(),

  firstName: z
    .string({ message: 'First name is required' })
    .min(2, 'First name minimum 2 characters')
    .max(100, 'First name maximum 50 characters'),

  middleName: z
    .string({ message: 'Middle name is required' })
    .min(2, 'Middle name minimum 2 characters')
    .max(100, 'Middle name maximum 100 characters')
    .optional()
    .or(z.literal('')),

  lastName: z
    .string({ message: 'Last name is required' })
    .min(2, 'Last name minimum 2 characters')
    .max(100, 'Last name maximum 100 characters')
    .optional()
    .or(z.literal('')),

  phoneCode: z
    .string({ message: 'Phone code is required' })
    .min(2, 'Phone code minimum 2 characters')
    .max(100, 'Phone code maximum 100 characters')
    .optional()
    .or(z.literal('')),

  phoneNumber: z
    .string({ message: 'Phone number is required' })
    .min(2, 'Phone number minimum 2 characters')
    .max(100, 'Phone number maximum 100 characters')
    .optional()
    .or(z.literal('')),

  address: z
    .string({ message: 'Address is required' })
    .min(2, 'Address minimum 2 characters')
    .max(255, 'Address maximum 255 characters')
    .optional()
    .or(z.literal(''))
}).superRefine(async (data, ctx) => {
  const { email, roleId, firstName, phoneCode, phoneNumber } = data

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

  if (!firstName || String(firstName) === "") {
    ctx.addIssue({
      code: 'custom',
      path: ['firstName'],
      message: 'First name is required',
    })
  }

  if (phoneCode && !phoneNumber) {
    ctx.addIssue({
      code: 'custom',
      path: ['phoneNumber'],
      message: 'Phone number is required if phone code is filled',
    })
  } else if (!phoneCode && phoneNumber) {
    ctx.addIssue({
      code: 'custom',
      path: ['phoneCode'],
      message: 'Phone code is required if phone number is filled',
    })
  }

  if (phoneNumber) {
    const existingPhoneNumber = await profileRepository.findBy(
      { field: 'phoneNumber', value: phoneNumber, withDeleted: true },
    )

    if (existingPhoneNumber) {
      ctx.addIssue({
        code: 'custom',
        path: ['phoneNumber'],
        message: 'Phone number already exist',
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
    .optional()
    .or(z.literal('')),

  roleId: z
    .uuid()
    .min(1, 'Role is required')
    .optional()
    .or(z.literal('')),

  firstName: z
    .string({ message: 'First name is required' })
    .min(2, 'First name is required')
    .max(100, 'First name maximum 50 characters'),

  middleName: z
    .string({ message: 'Middle name is required' })
    .min(2, 'Middle name is required')
    .max(100, 'Middle name maximum 50 characters')
    .optional()
    .or(z.literal('')),

  lastName: z
    .string({ message: 'Last name is required' })
    .min(2, 'Last name is required')
    .max(100, 'Last name maximum 50 characters')
    .optional()
    .or(z.literal('')),

  phoneCode: z
    .string({ message: 'Phone code is required' })
    .min(2, 'Phone code is required')
    .max(100, 'Phone code maximum 50 characters')
    .optional()
    .or(z.literal('')),

  phoneNumber: z
    .string({ message: 'Phone number is required' })
    .min(2, 'Phone number is required')
    .max(100, 'Phone number maximum 50 characters')
    .optional()
    .or(z.literal('')),

  address: z
    .string({ message: 'Address is required' })
    .min(2, 'Address is required')
    .max(255, 'Address maximum 50 characters')
    .optional()
    .or(z.literal(''))
}).superRefine(async (data, ctx) => {
  const { id, email, roleId, firstName, phoneCode, phoneNumber } = data

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

  if (!firstName || String(firstName) === "") {
    ctx.addIssue({
      code: 'custom',
      path: ['firstName'],
      message: 'First name is required',
    })
  }

  if (phoneCode && !phoneNumber) {
    ctx.addIssue({
      code: 'custom',
      path: ['phoneNumber'],
      message: 'Phone number is required if phone code is filled',
    })
  } else if (!phoneCode && phoneNumber) {
    ctx.addIssue({
      code: 'custom',
      path: ['phoneCode'],
      message: 'Phone code is required if phone number is filled',
    })
  }

  if (phoneNumber) {
    const existingPhoneNumber = await profileRepository.findByExceptBy(
      { field: 'phoneNumber', value: phoneNumber, withDeleted: true },
      { field: 'userId', value: id }
    )

    if (existingPhoneNumber) {
      ctx.addIssue({
        code: 'custom',
        path: ['phoneNumber'],
        message: 'Phone number already exist',
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