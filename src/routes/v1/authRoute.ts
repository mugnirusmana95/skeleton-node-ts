import express from 'express'

import authController from '~/controllers/v1/authController'

import { validate } from '~/middlewares/validationMiddleware'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { unAuthMiddleware } from '~/middlewares/unAuthMiddleware'
import { authRefreshTokenMiddleware } from '~/middlewares/authRefreshTokenMiddleware'

import authValidation from '~/validations/v1/authValidation'

const app = express()

app.post(
  '/login',
  unAuthMiddleware,
  validate(authValidation.loginAuthSchema),
  authController.login
)

app.post(
  '/refresh-token',
  authRefreshTokenMiddleware,
  authController.refreshToken
)

app.post(
  '/activation-request',
  unAuthMiddleware,
  validate(authValidation.activationRequestSchema),
  authController.activationRequest
)

app.post(
  '/activation-submit',
  unAuthMiddleware,
  validate(authValidation.activationSubmitSchema),
  authController.activationSubmit
)

app.post(
  '/change-password-request',
  unAuthMiddleware,
  validate(authValidation.changePasswordRequestSchema),
  authController.changePasswordRequest
)

app.post(
  '/change-password-submit',
  unAuthMiddleware,
  validate(authValidation.changePasswordSubmitSchema),
  authController.changePasswordSubmit
)

app.post(
  '/logout',
  authMiddleware,
  authController.logout
)

export default app