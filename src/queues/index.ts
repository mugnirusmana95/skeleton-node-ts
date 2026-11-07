import {
  Queue,
  randomUUID,
  type JobsOptions,
} from 'bullmq'
import { ExtractDataType, ExtractNameType } from 'bullmq/dist/esm/types/queue-type'

import {
  createRedisConnection,
  REDIS_ENABLED,
  REDIS_PREFIX,
} from '~/configs/redis'
import { EStatusJob, JobQueue } from '~/entities/jobQueueEntity'

import repository from '~/repositories'

export enum EQueueNames {
  SEND_EMAIL = 'send-email'
}

const queues = new Set<Queue>()

const getDelay = (date?: Date | string): number | undefined => {
  if (!date) return undefined

  const timestamp = date instanceof Date
    ? date.getTime()
    : new Date(date).getTime()

  if (Number.isNaN(timestamp)) {
    throw new Error('Invalid job delay date')
  }

  return Math.max(0, timestamp - Date.now())
}

export const createQueue = <
  T,
  TName extends string = string
>(
  queueName: string,
  jobName: TName = queueName as TName
) => {
  let queue: Queue<T, any, TName> | null = null

  const getQueue = () => {
    if (!REDIS_ENABLED) {
      throw new Error('Redis is disabled')
    }

    if (!queue) {
      queue = new Queue<T, any, TName>(queueName, {
        connection: createRedisConnection(),
        prefix: REDIS_PREFIX,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      })

      queues.add(queue)
    }

    return queue
  }

  return {
    dispatch: async (
      payload: T,
      delayUntil?: Date | string,
      options?: JobsOptions
    ) => {
      const jobId = randomUUID()
      const delay = getDelay(delayUntil)

      const params = {
        attemptsMade: 0,
        opts: {},
        payload
      }

      const scheduledAt = delayUntil
        ? new Date(delayUntil)
        : new Date()

      await repository.create(JobQueue, {
        jobId: jobId,
        status: EStatusJob.WAITING,
        payload: JSON.stringify(params),
        scheduledAt,
      })

      const job = await getQueue().add(
        jobName as ExtractNameType<T, TName>,
        payload as ExtractDataType<T, T>,
        {
          ...options,
          ...(delay !== undefined ? { delay } : {}),
          jobId
        }
      )

      return job
    },

    getQueue,

    close: async () => {
      if (queue) {
        await queue.close()
        queues.delete(queue)
        queue = null
      }
    }
  }
}

export const closeAllQueues = async () => {
  await Promise.all(
    Array.from(queues).map((queue) => queue.close())
  )

  queues.clear()
}