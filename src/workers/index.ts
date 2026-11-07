import 'dotenv/config'

import { Job, Worker } from 'bullmq'

import { AppDataSource } from '~/configs/dataSource'
import { REDIS_ENABLED } from '~/configs/redis'

import { createSendEmailWorker } from '~/workers/sendEmailWorker'
import repository from '~/repositories'
import { EStatusJob, JobQueue } from '~/entities/jobQueueEntity'

const workers: Worker[] = []

export const updateJobQueue = async (
  job: Job,
  {
    date,
    dateName
  }: {
    date?: Date | undefined,
    dateName?: "executedAt" | "scheduledAt" | "completedAt" | null
  },
  status: EStatusJob
) => {
  const jobId = String(job.id)
  const attemptsMade = job.attemptsMade
  const opts = job.opts
  const payload = job.data

  const updatedPayload = {
    attemptsMade,
    opts,
    payload
  }

  let queuePayload = {
    status,
    payload: JSON.stringify(updatedPayload),
  }

  if (dateName) {
    queuePayload = {
      ...queuePayload,
      [dateName]: date
    }
  }

  await repository.updateBy(JobQueue, {
    field: 'jobId',
    value: jobId,
  }, {
    ...queuePayload,
    updatedAt: date
  })
}

export const startWorkers = async () => {
  if (!REDIS_ENABLED) {
    console.log('Redis is disabled. Workers will not start.')
    return
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  console.log('Database connected')

  workers.push(
    createSendEmailWorker(),
  )

  await Promise.all(
    workers.map((worker) => worker.waitUntilReady())
  )

  console.log('All workers are running')
}

export const stopWorkers = async () => {
  await Promise.all(
    workers.map((worker) => worker.close())
  )

  workers.length = 0

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
  }

  console.log('All workers stopped')
}

const shutdown = async () => {
  await stopWorkers()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

startWorkers().catch(async (error) => {
  console.error('Failed to start workers:', error)

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
  }

  process.exit(1)
})