import express from 'express'

import roleController from '~/controllers/v1/roleController'

import { validate } from '~/middlewares/validationMiddleware'

import roleValidation from '~/validations/v1/roleValidation'

const app = express()

app.get(
  '/',
  validate(roleValidation.listRoleSchema, 'query'),
  roleController.getList
)

app.post(
  '/',
  validate(roleValidation.createRoleSchema),
  roleController.create
)

app.get(
  '/:id',
  validate(roleValidation.detailRoleSchema, 'params'),
  roleController.getDetail
)

app.patch('/:id',
  validate(roleValidation.detailRoleSchema, 'params'),
  validate(roleValidation.updateRoleSchema, 'req'),
  roleController.update
)

app.put('/activation/:id',
  validate(roleValidation.activationRoleSchema, 'params'),
  validate(roleValidation.activationRoleSchema, 'req'),
  roleController.activation
)

app.delete(
  '/:id',
  validate(roleValidation.detailRoleSchema, 'params'),
  roleController.delete
)

app.delete(
  '/permanent/:id',
  validate(roleValidation.detailRoleSchema, 'params'),
  roleController.permanentDelete
)

export default app