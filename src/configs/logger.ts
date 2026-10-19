import pino from 'pino'

const mode = process.env.MODE ?? 'development'
const isProduction = mode === 'production'
const isLocalhost = mode === 'localhost'

const targets: pino.TransportTargetOptions[] = []

if (!isLocalhost) {
  targets.push({
    target: '@axiomhq/pino',
    level: process.env.LOG_LEVEL ?? 'info',
    options: {
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_API_KEY,
      edge: 'us-east-1.aws.edge.axiom.co',
    },
  })

  if (!isProduction) {
    targets.push({
      target: 'pino-pretty',
      level: process.env.LOG_LEVEL ?? 'info',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    })
  }
}

export const logger = pino(
  {
    level: isLocalhost ? 'silent' : process.env.LOG_LEVEL ?? 'info',
    base: {
      service: String(process.env.NAME),
      environment: mode,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  ...(isLocalhost ? [] : [pino.transport({ targets })]),
)