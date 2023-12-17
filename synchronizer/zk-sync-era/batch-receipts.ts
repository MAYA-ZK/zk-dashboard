import { eq, isNull } from 'drizzle-orm'

import type { ZkSyncEraBatch } from '@zk-dashboard/common/database/schema'
import {
  zkSyncEraBatchReceipts,
  zkSyncEraBatches,
} from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import { ethereumRpc } from '@zk-dashboard/common/integrations/ethereum/rpc'
import { logger } from '@zk-dashboard/common/lib/logger'

import { LOGGER_CONFIG } from './constants'

const BATCHES_LIMIT = 400
const CHUNK_SIZE = 50

const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.batchReceipts,
}

async function getBatchesWithoutReceipt() {
  return await db
    .select({
      id: zkSyncEraBatches.id,
      commit_tx_hash: zkSyncEraBatches.commit_tx_hash,
      prove_tx_hash: zkSyncEraBatches.prove_tx_hash,
      execute_tx_hash: zkSyncEraBatches.execute_tx_hash,
      l2_tx_count: zkSyncEraBatches.l2_tx_count,
    })
    .from(zkSyncEraBatches)
    .leftJoin(
      zkSyncEraBatchReceipts,
      eq(zkSyncEraBatches.id, zkSyncEraBatchReceipts.batch_id)
    )
    .where(isNull(zkSyncEraBatchReceipts.batch_id))
    .limit(BATCHES_LIMIT)
}

type BatchForReceipt = Pick<
  ZkSyncEraBatch,
  'id' | 'commit_tx_hash' | 'prove_tx_hash' | 'execute_tx_hash' | 'l2_tx_count'
>

async function getBatchReceipt(batch: BatchForReceipt) {
  const [commitTxFee, provenTxFee, executeTxFee] = await Promise.all([
    ethereumRpc.getEffectiveTransactionPriceByHash(batch.commit_tx_hash),
    ethereumRpc.getEffectiveTransactionPriceByHash(batch.prove_tx_hash),
    ethereumRpc.getEffectiveTransactionPriceByHash(batch.execute_tx_hash),
  ])

  const totalTxFee = commitTxFee.plus(provenTxFee).plus(executeTxFee)
  const totalTxFeePerUnit =
    batch.l2_tx_count === 0
      ? 0
      : totalTxFee.div(batch.l2_tx_count).decimalPlaces(0)

  return {
    batch_id: batch.id,
    commit_tx_fee: BigInt(commitTxFee.toString()),
    proven_tx_fee: BigInt(provenTxFee.toString()),
    execute_tx_fee: BigInt(executeTxFee.toString()),
    total_tx_fee: BigInt(totalTxFee.toString()),
    total_tx_fee_per_unit: BigInt(totalTxFeePerUnit.toString()),
  }
}

function getBatchesReceipts(batchesArray: Array<BatchForReceipt>) {
  return Promise.all(batchesArray.map(getBatchReceipt))
}

function insertBatchReceipts(
  batchReceiptsValues: Array<typeof zkSyncEraBatchReceipts.$inferInsert>
) {
  return db
    .insert(zkSyncEraBatchReceipts)
    .values(batchReceiptsValues)
    .onConflictDoNothing()
}

export async function syncBatchReceipts() {
  logger.info(LOGGER_TAG, 'syncing batch receipts...')

  const batchesWithoutReceipts = await getBatchesWithoutReceipt()

  logger.info(
    LOGGER_TAG,
    `found ${batchesWithoutReceipts.length} batches without receipt from max ${BATCHES_LIMIT} batches`
  )

  for (let i = 0; i < batchesWithoutReceipts.length; i += CHUNK_SIZE) {
    logger.info(
      LOGGER_TAG,
      `processing chunk of batches ${i} - ${i + CHUNK_SIZE}...`
    )
    const batchReceiptsValues = await getBatchesReceipts(
      batchesWithoutReceipts.slice(i, i + CHUNK_SIZE)
    )

    logger.info(
      LOGGER_TAG,
      `inserting chunk of batches ${i} - ${i + CHUNK_SIZE}...`
    )
    await insertBatchReceipts(batchReceiptsValues)
  }

  if (batchesWithoutReceipts.length === BATCHES_LIMIT) {
    logger.info(LOGGER_TAG, `reached limit, continue in next run`)
    return syncBatchReceipts()
  }

  logger.info(LOGGER_TAG, 'done syncing batch receipts')
}
