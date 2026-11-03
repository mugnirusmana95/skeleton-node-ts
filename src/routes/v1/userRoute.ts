import express from 'express'

import userController from '~/controllers/v1/userController'

import { permissionMiddleware } from '~/middlewares/permissionMiddleware'
import { validate } from '~/middlewares/validationMiddleware'

import userValidation from '~/validations/v1/userValidation'

const app = express()

app.get(
  '/',
  permissionMiddleware('user.index'),
  validate(userValidation.listUserSchema, 'query'),
  userController.getList
)

app.post(
  '/',
  permissionMiddleware('user.create'),
  validate(userValidation.createUserSchema),
  userController.create
)

app.get(
  '/:id',
  permissionMiddleware('user.view'),
  validate(userValidation.detailUserSchema, 'params'),
  userController.getDetail
)

app.get(
  '/status/:id',
  permissionMiddleware('user.view'),
  validate(userValidation.detailUserSchema, 'params'),
  userController.getByStatus
)

app.patch(
  '/:id',
  permissionMiddleware('user.update'),
  validate(userValidation.detailUserSchema, 'params'),
  validate(userValidation.updateUserSchema, 'req'),
  userController.update
)

app.put(
  '/change-status/:id',
  permissionMiddleware('user.update'),
  validate(userValidation.detailUserSchema, 'params'),
  validate(userValidation.changeStatusUserSchema, 'req'),
  userController.changeStatus
)

app.put(
  '/reset-password/:id',
  permissionMiddleware('user.update'),
  validate(userValidation.detailUserSchema, 'params'),
  userController.resetPassword
)

app.delete(
  '/:id',
  permissionMiddleware('user.delete'),
  validate(userValidation.detailUserSchema, 'params'),
  userController.delete
)

app.delete(
  '/permanent/:id',
  permissionMiddleware('su', 'role'),
  validate(userValidation.detailUserSchema, 'params'),
  userController.permanentDelete
)

export default app