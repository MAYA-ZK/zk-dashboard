import {
  zkSyncEraBatches,
  zkSyncEraBlocks,
} from '@zk-dashboard/common/database/schema'

import { createDataPurge } from '../common/purge'
import { LOGGER_CONFIG } from './constants'

const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.purge,
}

const purgeBlocks = createDataPurge({
  tableName: 'zk_sync_era_blocks',
  table: zkSyncEraBlocks,
  tableColumnKey: 'timestamp',
  loggerTag: LOGGER_TAG,
})

const purgeBatches = createDataPurge({
  tableName: 'zk_sync_era_batches',
  table: zkSyncEraBatches,
  tableColumnKey: 'timestamp',
  loggerTag: LOGGER_TAG,
})

export async function purgeZkSyncEra(olderThanDays: number) {
  await purgeBatches(olderThanDays)
  await purgeBlocks(olderThanDays)
}
