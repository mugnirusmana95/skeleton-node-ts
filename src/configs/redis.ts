
import Redis, { Cluster } from 'ioredis'

const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true'
const REDIS_CLUSTER = process.env.REDIS_CLUSTER === 'true'

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379)
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined
const REDIS_DB = Number(process.env.REDIS_DB || 0)
const REDIS_PREFIX = process.env.REDIS_PREFIX || '{my-app}'

if (REDIS_ENABLED && REDIS_CLUSTER && !/\{[^}]+\}/.test(REDIS_PREFIX)) {
  throw new Error(
    'REDIS_PREFIX must contain a Redis hash tag when using Redis Cluster'
  )
}

if (REDIS_ENABLED && REDIS_CLUSTER && REDIS_DB !== 0) {
  console.warn('Redis Cluster only supports database 0. REDIS_DB will be ignored.')
}

export { REDIS_ENABLED, REDIS_PREFIX }

export const createRedisConnection = (isWorker = false) => {
  if (!REDIS_ENABLED) {
    throw new Error('Redis connection is disabled')
  }

  const redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: isWorker ? null : 1,
  }

  if (REDIS_CLUSTER) {
    const cluster = new Cluster(
      [{ host: REDIS_HOST, port: REDIS_PORT }],
      {
        redisOptions: {
          password: REDIS_PASSWORD,
          maxRetriesPerRequest: isWorker ? null : 1,
        },
      }
    )

    return cluster
  }

  return new Redis({
    ...redisOptions,
    db: REDIS_DB,
  })
}
