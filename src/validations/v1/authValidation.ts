import { z } from 'zod'

export type TLoginAuthBody = z.infer<typeof loginAuthSchema>
export type TActivationRequestBody = z.infer<typeof activationRequestSchema>
export type TActivationSubmitBody = z.infer<typeof activationSubmitSchema>
export type TChangePasswordRequestBody = z.infer<typeof changePasswordRequestSchema>
export type TChangePasswordSubmitBody = z.infer<typeof changePasswordSubmitSchema>

const loginAuthSchema = z.object({
  username: z
    .string('Username or Email is required')
    .min(1, 'Username or Email is required'),

  password: z
    .string('Password is required')
    .min(1, 'Password is required'),
})

const activationRequestSchema = z.object({
  email: z
    .email('Email is required')
    .min(1, 'Email is required'),
})

const activationSubmitSchema = z.object({
  code: z
    .string('Code is required')
    .min(1, 'Code is required')
    .max(5, 'Code maximum 5 characters'),
})

const changePasswordRequestSchema = z.object({
  email: z
    .email('Email is required')
    .min(1, 'Email is required'),
})

const changePasswordSubmitSchema = z.object({
  password: z
    .string('Password is required')
    .min(1, 'Password is required'),

  passwordConfirmation: z
    .string('Password confirmation is required')
    .min(1, 'Password confirmation is required'),

  code: z
    .string('Code is required')
    .min(1, 'Code is required')
    .max(5, 'Code maximum 5 characters')
}).superRefine((data, ctx) => {
  const { password, passwordConfirmation } = data

  if (!/[a-zA-Z]/.test(password)) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Password must contain at least one letter',
    })
  }

  if (!/[A-Z]/.test(password)) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Password must contain at least one uppercase letter',
    })
  }

  if (!/[0-9]/.test(password)) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Password must contain at least one number',
    })
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Password must contain at least one symbol',
    })
  }

  if (
    password &&
    passwordConfirmation &&
    password !== passwordConfirmation
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['passwordConfirmation'],
      message: 'Password confirmation does not match with password',
    })
  }
})

export default {
  loginAuthSchema,
  activationRequestSchema,
  activationSubmitSchema,
  changePasswordRequestSchema,
  changePasswordSubmitSchema
}