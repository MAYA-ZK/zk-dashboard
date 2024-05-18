import * as Sentry from '@sentry/node'
import fs from 'fs'

import { logger } from '@zk-dashboard/common/lib/logger'

import('dotenv').then(async ({ config }) => {
  if (fs.existsSync('./.env')) {
    config()
  } else {
    config({ path: '../.env' })
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.8,
    _experiments: {
      metricsAggregator: true,
    },
  })

  process.on('uncaughtException', (error, origin) => {
    logger.error({ message: 'Uncaught Exception', err: error, origin })
    Sentry.captureException(error)
  })

  const { sync } = await import('./sync')
  try {
    await sync()
  } catch (error: unknown) {
    const errorMessage =
      'message' in (error as Error) ? (error as Error).message : 'Unknown error'
    logger.error({
      message: 'Error in synchronizer',
      error: errorMessage,
    })
    Sentry.captureException(error)
  }
})

export {}
