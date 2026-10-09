import express from 'express'

import userRoute from '~/routes/v1/userRoute'
import roleRoute from '~/routes/v1/roleRoute'

const app = express()

app.use('/roles', roleRoute)
app.use('/users', userRoute)

export default app