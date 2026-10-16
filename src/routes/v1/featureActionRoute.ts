import express from 'express'

import featureActionController from '~/controllers/v1/featureActionController'

import { validate } from '~/middlewares/validationMiddleware'

import featureActionValidation from '~/validations/v1/featureActionValidation'

const app = express()

app.get(
  '/',
  validate(featureActionValidation.listFeatureActionSchema, 'query'),
  featureActionController.getList
)

app.post(
  '/',
  validate(featureActionValidation.createFeatureActionSchema),
  featureActionController.create
)

app.get(
  '/:id',
  validate(featureActionValidation.detailFeatureActionSchema, 'params'),
  featureActionController.getDetail
)

app.patch(
  '/:id',
  validate(featureActionValidation.detailFeatureActionSchema, 'params'),
  validate(featureActionValidation.updateFeatureActionSchema, 'req'),
  featureActionController.update
)

app.delete(
  '/:id',
  validate(featureActionValidation.detailFeatureActionSchema, 'params'),
  featureActionController.delete
)

export default app