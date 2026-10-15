import 'reflect-metadata'
import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'

import { AppDataSource } from '~/configs/dataSource'

import { errorMiddleware } from '~/middlewares/errorMiddleware'

import routesV1 from '~/routes/v1'
import { timezoneMiddleware } from './middlewares/timezoneMiddleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const MODE = String(process.env.MODE)
const MODE_ALLOWED = [
  'localhost',
  'development',
  'staging',
  'production',
]

app.use(express.json())

app.use(cookieParser())

app.use(timezoneMiddleware)

app.use('/api/v1', routesV1)

app.use(errorMiddleware)

if (!MODE || !MODE_ALLOWED.includes(MODE)) {
  console.error(`env.MODE only allowed: ${MODE_ALLOWED.join(', ')}`)
  process.exit(1)
}

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