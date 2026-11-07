
import { Job, Worker } from 'bullmq'

import {
  createRedisConnection,
  REDIS_PREFIX,
} from '~/configs/redis'
import { TSendEmailPayload } from '~/queues/sendEmailQueue'

import { EStatusJob } from '~/entities/jobQueueEntity'

import { EQueueNames } from '~/queues'
import { updateJobQueue } from '~/workers'

const handle = async (job: Job) => {
  //todo here the logic send email or call send email service
  console.log('[QUEUE][SEND EMAIL] Processing with Job ID:', job.id)
}

export const createSendEmailWorker = () => {
  const worker = new Worker<TSendEmailPayload>(
    EQueueNames.SEND_EMAIL,
    async (job) => {
      await updateJobQueue(job, { date: new Date(), dateName: 'executedAt' }, EStatusJob.PROCESSING)
      await handle(job)
    },
    {
      connection: createRedisConnection(true),
      prefix: REDIS_PREFIX,
      concurrency: 5,
    }
  )

  worker.on('completed', async (job) => {
    await updateJobQueue(job, { date: new Date(), dateName: 'completedAt' }, EStatusJob.COMPLETED)
    console.log(`[QUEUE][SEND EMAIL] completed with Job ID: ${job.id}`)
  })

  worker.on('failed', async (job, error) => {
    if (job) {
      const attemptsMade = job.attemptsMade
      const maxAttempts = job.opts.attempts ?? 1

      const statusFailed = attemptsMade >= maxAttempts
        ? EStatusJob.FAILED
        : EStatusJob.WAITING

      await updateJobQueue(job, {}, statusFailed)
    }

    console.error(`[QUEUE][SEND EMAIL] failed with Job ID: ${job?.id}`, error)
  })

  worker.on('error', (error) => {
    console.error('[QUEUE][SEND EMAIL] worker error:', error)
  })

  return worker
}
