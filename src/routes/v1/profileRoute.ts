import express from 'express'

import profileController from '~/controllers/v1/profileController'

import { validate } from '~/middlewares/validationMiddleware'

import profileValidation from '~/validations/v1/profileValidation'

const app = express()

app.get(
  '/:id',
  validate(profileValidation.detailProfileSchema, 'params'),
  profileController.getDetail
)

export default app