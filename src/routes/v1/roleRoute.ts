import express from 'express'

import roleController from '~/controllers/v1/roleController'

import { validate } from '~/middlewares/validationMiddleware'

import {
  createRoleSchema,
  listRoleSchema,
  detailRoleSchema
} from '~/validations/v1/roleValidation'

const app = express()

app.get('/', validate(listRoleSchema, 'query'), roleController.getList)
app.post('/', validate(createRoleSchema), roleController.create)
app.get('/:id', validate(detailRoleSchema, 'params'), roleController.getDetail)
// app.patch('/:id', roleController.update)
// app.put('/:id', roleController.activation)
app.delete('/:id', validate(detailRoleSchema, 'params'), roleController.delete)

export default app