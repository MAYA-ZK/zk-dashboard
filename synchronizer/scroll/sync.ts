import { logger } from '@zk-dashboard/common/lib/logger'

import { runWithRetry } from '../common/utils'
import { syncBatchReceipts } from './batch-receipts'
import { syncBatches } from './batches'
import { syncBlocks } from './blocks'

const MAX_RETRIES = 4

export async function syncScroll() {
  logger.info('syncing scroll data')

  await runWithRetry(syncBatches, { retries: MAX_RETRIES })
  await runWithRetry(syncBatchReceipts, { retries: MAX_RETRIES })
  await runWithRetry(syncBlocks, { retries: MAX_RETRIES })

  logger.info('done syncing scroll data')
}
