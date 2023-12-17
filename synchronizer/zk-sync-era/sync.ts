import { logger } from '@zk-dashboard/common/lib/logger'

import { runWithRetry } from '../common/utils'
import { syncBatchReceipts } from './batch-receipts'
import { syncBatches } from './batches'
import { syncBlocks } from './blocks'

const MAX_RETRIES = 4

export async function syncZkSyncEra() {
  logger.info('syncing zkSync Era data')

  await runWithRetry(syncBlocks, { retries: MAX_RETRIES })
  await runWithRetry(syncBatches, { retries: MAX_RETRIES })
  await runWithRetry(syncBatchReceipts, { retries: MAX_RETRIES })

  logger.info('done zkSync Era data')
}
