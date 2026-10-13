import express from 'express'

import userController from '~/controllers/v1/userController'

import { validate } from '~/middlewares/validationMiddleware'

import userValidation from '~/validations/v1/userValidation'

const app = express()

app.get(
  '/',
  validate(userValidation.listUserSchema, 'query'),
  userController.getList
)

app.post(
  '/',
  validate(userValidation.createUserSchema),
  userController.create
)

app.get(
  '/:id',
  validate(userValidation.detailUserSchema, 'params'),
  userController.getDetail
)

app.patch(
  '/:id',
  validate(userValidation.detailUserSchema, 'params'),
  validate(userValidation.updateUserSchema, 'req'),
  userController.update
)

app.put(
  '/change-status/:id',
  validate(userValidation.detailUserSchema, 'params'),
  validate(userValidation.changeStatusUserSchema, 'req'),
  userController.changeStatus
)

app.put(
  '/reset-password/:id',
  validate(userValidation.detailUserSchema, 'params'),
  userController.resetPassword
)

app.delete(
  '/:id',
  validate(userValidation.detailUserSchema, 'params'),
  userController.delete
)

app.delete(
  '/permanent/:id',
  validate(userValidation.detailUserSchema, 'params'),
  userController.permanentDelete
)

export default app