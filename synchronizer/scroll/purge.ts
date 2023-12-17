import {
  scrollBatches,
  scrollBlocks,
} from '@zk-dashboard/common/database/schema'

import { createDataPurge } from '../common/purge'
import { LOGGER_CONFIG } from './constants'

const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.purge,
}

const purgeBlocks = createDataPurge({
  tableName: 'scroll_blocks',
  table: scrollBlocks,
  tableColumnKey: 'timestamp',
  loggerTag: LOGGER_TAG,
})

const purgeBatches = createDataPurge({
  tableName: 'scroll_batches',
  table: scrollBatches,
  tableColumnKey: 'timestamp',
  loggerTag: LOGGER_TAG,
})

export async function purgeScroll(olderThanDays: number) {
  await purgeBatches(olderThanDays)
  await purgeBlocks(olderThanDays)
}
