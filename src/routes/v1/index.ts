import express from 'express'

import { authMiddleware } from '~/middlewares/authMiddleware'

import authRoute from '~/routes/v1/authRoute'
import roleRoute from '~/routes/v1/roleRoute'
import userRoute from '~/routes/v1/userRoute'
import profileRoute from '~/routes/v1/profileRoute'

const app = express()

app.use('/auth', authRoute)
app.use('/roles', authMiddleware, roleRoute)
app.use('/users', authMiddleware, userRoute)
app.use('/profile', authMiddleware, profileRoute)

export default app