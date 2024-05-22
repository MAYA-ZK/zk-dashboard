import { isValid } from 'date-fns'

import { polygonZkEvmBatches } from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import type { PolygonZkEvmRpcBatch } from '@zk-dashboard/common/integrations/polygon-zk-evm/rpc'
import { polygonZkEvmRpc } from '@zk-dashboard/common/integrations/polygon-zk-evm/rpc'
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
const ENTITY_NUMBER_SPAN = 10_000
/**
 * Number of batches fetched and inserted at once
 */
const BATCHES_CHUNK_SIZE = 100
/**
 * Number of batches to get from the database at once
 */
const MAX_BATCHES_TO_GET = 1_000

type FilteredBatch = {
  [K in keyof PolygonZkEvmRpcBatch]: K extends 'verifyBatchTxHash'
    ? string
    : K extends 'sendSequencesTxHash'
      ? string
      : PolygonZkEvmRpcBatch[K]
}

async function insertBatches(batchesInput: Array<PolygonZkEvmRpcBatch>) {
  logger.info(
    LOGGER_TAG,
    `inserting batches from ${batchesInput[0]?.number} ${batchesInput[batchesInput.length - 1]?.number}`
  )

  const finalized = batchesInput.filter((batch): batch is FilteredBatch => {
    if (!isValid(batch.timestamp)) {
      logger.warn(
        LOGGER_TAG,
        `batch ${batch.number} has invalid timestamp, skipping...`
      )
      return false
    }

    if (!batch.verifyBatchTxHash || !batch.sendSequencesTxHash) {
      logger.info(
        LOGGER_TAG,
        `batch ${batch.number} is not finalized, skipping...`
      )
      return false
    }

    return true
  })

  if (finalized.length === 0) {
    logger.info(LOGGER_TAG, `no finalized batches to insert`)
    return
  }

  const values = finalized.map((batch) => ({
    number: batch.number,
    timestamp: new Date(batch.timestamp),
    send_sequences_tx_hash: batch.sendSequencesTxHash,
    verify_batch_tx_hash: batch.verifyBatchTxHash,
    acc_input_hash: batch.accInputHash,
    blocks: batch.blocks ?? [],
    transactions: batch.transactions ?? [],
    coinbase: batch.coinbase,
    closed: batch.closed,
    global_exit_root: batch.globalExitRoot,
    local_exit_root: batch.localExitRoot,
    mainnet_exit_root: batch.mainnetExitRoot,
    rollup_exit_root: batch.rollupExitRoot,
    state_root: batch.stateRoot,
  }))

  return db.insert(polygonZkEvmBatches).values(values).onConflictDoNothing()
}

export const syncBatches = createBatchSynchronizer({
  table: polygonZkEvmBatches,
  insertBatches,
  getBatch: polygonZkEvmRpc.getBatch,
  batchesChunkSize: BATCHES_CHUNK_SIZE,
  entityNumberSpan: ENTITY_NUMBER_SPAN,
  loggerTag: LOGGER_TAG,
  maxBatchesToGet: MAX_BATCHES_TO_GET,
  maxDataAgeInDays: MAX_DATA_AGE_IN_DAYS,
})
