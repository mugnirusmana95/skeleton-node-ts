import express from 'express'

import roleController from '~/controllers/v1/roleController'

import { permissionMiddleware } from '~/middlewares/permissionMiddleware'
import { validate } from '~/middlewares/validationMiddleware'

import roleValidation from '~/validations/v1/roleValidation'

const app = express()

app.get(
  '/',
  permissionMiddleware('role.index'),
  validate(roleValidation.listRoleSchema, 'query'),
  roleController.getList
)

app.post(
  '/',
  permissionMiddleware('role.create'),
  validate(roleValidation.createRoleSchema),
  roleController.create
)

app.get(
  '/:id',
  permissionMiddleware('role.view'),
  validate(roleValidation.detailRoleSchema, 'params'),
  roleController.getDetail
)

app.patch('/:id',
  permissionMiddleware('role.update'),
  validate(roleValidation.detailRoleSchema, 'params'),
  validate(roleValidation.updateRoleSchema, 'req'),
  roleController.update
)

app.put('/activation/:id',
  permissionMiddleware('role.update'),
  validate(roleValidation.activationRoleSchema, 'params'),
  validate(roleValidation.activationRoleSchema, 'req'),
  roleController.activation
)

app.delete(
  '/:id',
  permissionMiddleware('role.delete'),
  validate(roleValidation.detailRoleSchema, 'params'),
  roleController.delete
)

app.delete(
  '/permanent/:id',
  permissionMiddleware('su', 'role'),
  validate(roleValidation.detailRoleSchema, 'params'),
  roleController.permanentDelete
)

export default app