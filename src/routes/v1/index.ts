import express from 'express'

import roleRoute from '~/routes/v1/roleRoute'
import userRoute from '~/routes/v1/userRoute'
import profileRoute from '~/routes/v1/profileRoute'

const app = express()

app.use('/roles', roleRoute)
app.use('/users', userRoute)
app.use('/profile', profileRoute)

export default app