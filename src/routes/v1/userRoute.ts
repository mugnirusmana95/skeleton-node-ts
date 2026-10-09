import express from 'express'

import userController from '~/controllers/v1/userController'

const app = express()

// app.get('/', userController.create)
app.post('/', userController.create)
app.get('/:id', userController.getDetail)
// app.patch('/{id}', userController.create)
// app.put('/{id}', userController.create)
// app.delete('/{id}', userController.create)

export default app