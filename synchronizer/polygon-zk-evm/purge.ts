import {
  polygonZkEvmBatches,
  polygonZkEvmBlocks,
} from '@zk-dashboard/common/database/schema'

import { createDataPurge } from '../common/purge'
import { LOGGER_CONFIG } from './constants'

const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.purge,
}

const purgeBlocks = createDataPurge({
  tableName: 'polygon_zk_evm_blocks',
  table: polygonZkEvmBlocks,
  tableColumnKey: 'timestamp',
  loggerTag: LOGGER_TAG,
})

const purgeBatches = createDataPurge({
  tableName: 'polygon_zk_evm_batches',
  table: polygonZkEvmBatches,
  tableColumnKey: 'timestamp',
  loggerTag: LOGGER_TAG,
})

export async function purgePolygonZkEvm(olderThanDays: number) {
  await purgeBatches(olderThanDays)
  await purgeBlocks(olderThanDays)
}
