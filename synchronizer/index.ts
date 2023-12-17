import * as Sentry from '@sentry/node'
import fs from 'fs'

import('dotenv').then(async ({ config }) => {
  if (fs.existsSync('./.env')) {
    config()
  } else {
    config({ path: '../.env' })
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.8,
  })

  const { sync } = await import('./sync')
  await sync()
})

export {}
