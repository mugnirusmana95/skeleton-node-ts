import express from 'express'

import featureController from '~/controllers/v1/featureController'

import { validate } from '~/middlewares/validationMiddleware'

import featureValidation from '~/validations/v1/featureValidation'

const app = express()

app.get(
  '/',
  validate(featureValidation.listFeatureSchema, 'query'),
  featureController.getList
)

app.post(
  '/',
  validate(featureValidation.createFeatureSchema),
  featureController.create
)

app.get(
  '/:id',
  validate(featureValidation.detailFeatureSchema, 'params'),
  featureController.getDetail
)

app.patch(
  '/:id',
  validate(featureValidation.detailFeatureSchema, 'params'),
  validate(featureValidation.updateFeatureSchema, 'req'),
  featureController.update
)

app.delete(
  '/:id',
  validate(featureValidation.detailFeatureSchema, 'params'),
  featureController.delete
)

export default app