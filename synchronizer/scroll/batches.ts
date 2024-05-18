import { scrollBatches } from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import type { ScrollRpcBatch } from '@zk-dashboard/common/integrations/scroll/rpc'
import { scrollRpc } from '@zk-dashboard/common/integrations/scroll/rpc'
import { logger } from '@zk-dashboard/common/lib/logger'

import { createBatchSynchronizer } from '../common/batches'
import { MAX_DATA_AGE_IN_DAYS } from '../common/constants'
import { LOGGER_CONFIG } from './constants'

const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.batches,
}

/**
 * When searching for the oldest batch, this specifies the span (step) between the batches to look for.
 */
const ENTITY_NUMBER_SPAN = 1_000
/**
 * Number of batches fetched and inserted at once
 */
const BATCHES_CHUNK_SIZE = 200
/**
 * Number of batches to get from the database at once
 */
const MAX_BATCHES_TO_GET = 1_000

async function insertBatches(batchesInput: Array<ScrollRpcBatch>) {
  logger.info(
    LOGGER_TAG,
    `inserting batches from ${batchesInput[0]?.number} ${batchesInput[batchesInput.length - 1]?.number}`
  )

  const finalized = batchesInput.filter((batch) => {
    return batch.rollup_status === 'finalized'
  })

  if (finalized.length === 0) {
    logger.info(LOGGER_TAG, `no finalized batches to insert`)
    return
  }

  return db.insert(scrollBatches).values(finalized).onConflictDoNothing()
}

export const syncBatches = createBatchSynchronizer({
  table: scrollBatches,
  insertBatches,
  getBatch: scrollRpc.getBatch,
  batchesChunkSize: BATCHES_CHUNK_SIZE,
  entityNumberSpan: ENTITY_NUMBER_SPAN,
  loggerTag: LOGGER_TAG,
  maxBatchesToGet: MAX_BATCHES_TO_GET,
  maxDataAgeInDays: MAX_DATA_AGE_IN_DAYS,
})
