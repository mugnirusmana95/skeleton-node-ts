import 'reflect-metadata'
import dotenv from 'dotenv'
import express from 'express'

import { AppDataSource } from '~/configs/dataSource'

import routesV1 from '~/routes/v1'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use('/api/v1', routesV1)

AppDataSource.initialize()
  .then(() => {
    console.log('Koneksi ke PostgreSQL berhasil via TypeORM!')
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Error saat koneksi ke database:', error)
  })