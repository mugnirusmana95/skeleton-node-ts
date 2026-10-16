import express from 'express'

import rolePermissionController from '~/controllers/v1/rolePermissionController'

import { validate } from '~/middlewares/validationMiddleware'

import rolePermissionValidation from '~/validations/v1/rolePermissionValidation'

const app = express()

app.get(
  '/:roleId',
  validate(rolePermissionValidation.detailRolePermissionSchema, 'params'),
  rolePermissionController.getList
)

app.patch(
  '/:roleId',
  validate(rolePermissionValidation.detailRolePermissionSchema, 'params'),
  validate(rolePermissionValidation.udpateRolePermissionSchema, 'body'),
  rolePermissionController.update
)

export default app