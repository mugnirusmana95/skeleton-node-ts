import express from 'express'

import { authMiddleware } from '~/middlewares/authMiddleware'
import { permissionMiddleware } from '~/middlewares/permissionMiddleware'

import authRoute from '~/routes/v1/authRoute'
import featureRoute from '~/routes/v1/featureRoute'
import featureActionRoute from '~/routes/v1/featureActionRoute'
import rolePermissionRoute from '~/routes/v1/rolePermissionRoute'
import roleRoute from '~/routes/v1/roleRoute'
import userRoute from '~/routes/v1/userRoute'
import profileRoute from '~/routes/v1/profileRoute'

const app = express()

app.use('/auth', authRoute)

app.use(
  '/features',
  authMiddleware,
  permissionMiddleware('su', 'role'),
  featureRoute
)

app.use(
  '/feature-actions',
  authMiddleware,
  permissionMiddleware('su', 'role'),
  featureActionRoute
)

// app.use(
//   '/feature-permissions',
//   authMiddleware,
//   permissionMiddleware('su', 'role'),
//   featureActionRoute
// )

app.use(
  '/role-permissions',
  authMiddleware,
  permissionMiddleware('su', 'role'),
  rolePermissionRoute
)

app.use(
  '/roles',
  authMiddleware,
  roleRoute
)

app.use(
  '/users',
  authMiddleware,
  permissionMiddleware('su', 'role'),
  userRoute
)

app.use(
  '/profile',
  authMiddleware,
  profileRoute
)

export default app