import { z } from 'zod'

import profileRepository from '~/repositories/v1/profileRepository'
import userRepository from '~/repositories/v1/userRepository'

export type TDetailProfileQuery = z.infer<typeof detailProfileSchema>
export type TUpdateProfileBody = z.infer<typeof updateProfileSchema>

const detailProfileSchema = z.object({
  userId: z.uuid('Id must be a valid UUID'),
})

const updateProfileSchema = z.object({
  userId: z.uuid('Id must be a valid UUID'),

  firstName: z
    .string('First name is required')
    .min(2, 'First name is required')
    .max(100, 'First name maximum 50 characters'),

  middleName: z
    .string('First name is required')
    .min(2, 'First name is required')
    .max(100, 'First name maximum 50 characters')
    .optional()
    .or(z.literal('')),

  lastName: z
    .string('Middle name is required')
    .min(2, 'Middle name is required')
    .max(100, 'Middle name maximum 50 characters')
    .optional()
    .or(z.literal('')),

  phoneCode: z
    .string('Phone code is required')
    .min(2, 'Phone code is required')
    .max(100, 'Phone code maximum 50 characters')
    .optional()
    .or(z.literal('')),

  phoneNumber: z
    .string('Phone number is required')
    .min(2, 'Phone number is required')
    .max(100, 'Phone number maximum 50 characters')
    .optional()
    .or(z.literal('')),

  address: z
    .string('Address is required')
    .min(2, 'Address is required')
    .max(255, 'Address maximum 50 characters')
    .optional()
    .or(z.literal(''))
}).superRefine(async (data, ctx) => {
  const { userId, firstName, phoneCode, phoneNumber } = data

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
      {
        field: 'phoneNumber',
        value: phoneNumber,
        withDeleted: true
      },
      { field: 'userId', value: userId }
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

export default {
  updateProfileSchema,
  detailProfileSchema
}