import { zkSyncEraBatches } from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import type { ZkSyncEraRpcBatch } from '@zk-dashboard/common/integrations/zk-sync-era/rpc'
import { zkSyncEraRpc } from '@zk-dashboard/common/integrations/zk-sync-era/rpc'
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
const ENTITY_NUMBER_SPAN = 5_000
/**
 * Number of batches fetched and inserted at once
 */
const BATCHES_CHUNK_SIZE = 100
/**
 * Number of batches to get from the database at once
 */
const MAX_BATCHES_TO_GET = 1_000

async function insertBatches(batchesInput: Array<ZkSyncEraRpcBatch>) {
  logger.info(
    LOGGER_TAG,
    `inserting batches from ${batchesInput[0]?.number} ${batchesInput[batchesInput.length - 1]?.number}`
  )

  const finalized = batchesInput.filter(
    (batch): batch is Extract<ZkSyncEraRpcBatch, { status: 'verified' }> => {
      if (batch.status === 'verified') {
        return true
      }

      logger.warn(
        LOGGER_TAG,
        `batch ${batch.number} is not finalized, skipping...`
      )
      return false
    }
  )

  if (finalized.length === 0) {
    logger.info(LOGGER_TAG, `no finalized batches to insert`)
    return
  }

  const values = finalized.map((batch) => ({
    number: batch.number,
    timestamp: batch.timestamp,
    status: batch.status,
    commit_tx_hash: batch.commitTxHash,
    committed_at: new Date(batch.committedAt),
    execute_tx_hash: batch.executeTxHash,
    executed_at: new Date(batch.executedAt),
    prove_tx_hash: batch.proveTxHash,
    proven_at: new Date(batch.provenAt),
    l1_gas_price: batch.l1GasPrice,
    l1_tx_count: batch.l1TxCount,
    l2_fair_gas_price: batch.l2FairGasPrice,
    l2_tx_count: batch.l2TxCount,
    root_hash: batch.rootHash,
    base_system_contracts_hashes_bootloader:
      batch.baseSystemContractsHashes.bootloader,
    base_system_contracts_hashes_default_aa:
      batch.baseSystemContractsHashes.default_aa,
  }))

  return db.insert(zkSyncEraBatches).values(values).onConflictDoNothing()
}

export const syncBatches = createBatchSynchronizer({
  table: zkSyncEraBatches,
  insertBatches,
  getBatch: zkSyncEraRpc.getBatch,
  batchesChunkSize: BATCHES_CHUNK_SIZE,
  entityNumberSpan: ENTITY_NUMBER_SPAN,
  loggerTag: LOGGER_TAG,
  maxBatchesToGet: MAX_BATCHES_TO_GET,
  maxDataAgeInDays: MAX_DATA_AGE_IN_DAYS,
})
