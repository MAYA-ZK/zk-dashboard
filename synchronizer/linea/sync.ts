import { logger } from '@zk-dashboard/common/lib/logger'

import { runWithRetry } from '../common/utils'
import { syncBlocks } from './blocks'
import { syncTransactions } from './transactions'

const MAX_RETRIES = 4

export async function syncLinea() {
  logger.info('syncing Linea data')

  await runWithRetry(syncTransactions, { retries: MAX_RETRIES })
  await runWithRetry(syncBlocks, { retries: MAX_RETRIES })

  logger.info('done syncing Linea data')
}
