import * as Sentry from '@sentry/node'
import type { FailedAttemptError } from 'p-retry'
import pRetry from 'p-retry'

import { logger } from '@zk-dashboard/common/lib/logger'

const MIN_TIMEOUT = 2_000 // 2 seconds minimum timeout between retries

export async function runWithRetry(
  fn: () => Promise<unknown>,
  { id, retries = 3 }: { id?: string; retries?: number }
) {
  const fnId = id ?? fn.name
  try {
    await pRetry(
      async () => {
        await fn()
      },
      {
        minTimeout: MIN_TIMEOUT,
        onFailedAttempt: (error: FailedAttemptError) => {
          logger.error(
            error,
            `Failed to ${fnId} for the ${error.attemptNumber} time`
          )
        },
        retries,
      }
    )
  } catch (error) {
    Sentry.captureException(error, { extra: { fnId } })
    logger.error(error, `Failed to ${fnId} after max retries`)
  }
}
