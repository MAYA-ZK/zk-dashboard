import { and, eq, isNull, ne } from 'drizzle-orm'

import type { ScrollBatch } from '@zk-dashboard/common/database/schema'
import {
  scrollBatchReceipts,
  scrollBatches,
} from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import { ethereumRpc } from '@zk-dashboard/common/integrations/ethereum/rpc'
import { logger } from '@zk-dashboard/common/lib/logger'

import { LOGGER_CONFIG } from './constants'

const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.batchReceipts,
}

const BATCHES_LIMIT = 400
const CHUNK_SIZE = 20

export async function getBatchesWithoutReceipt() {
  return await db
    .select({
      id: scrollBatches.id,
      commit_tx_hash: scrollBatches.commit_tx_hash,
      finalize_tx_hash: scrollBatches.finalize_tx_hash,
      total_tx_num: scrollBatches.total_tx_num,
      rollup_status: scrollBatches.rollup_status,
    })
    .from(scrollBatches)
    .leftJoin(
      scrollBatchReceipts,
      eq(scrollBatches.id, scrollBatchReceipts.batch_id)
    )
    // skip index 0, it has no commit tx
    .where(
      and(isNull(scrollBatchReceipts.batch_id), ne(scrollBatches.number, 0))
    )
    .limit(BATCHES_LIMIT)
}

type BatchForReceipt = Pick<
  ScrollBatch,
  'id' | 'commit_tx_hash' | 'finalize_tx_hash' | 'total_tx_num'
>

async function getBatchReceipt(batch: BatchForReceipt) {
  const commit_tx_effective_price =
    await ethereumRpc.getEffectiveTransactionPriceByHash(batch.commit_tx_hash!)
  const finalize_tx_effective_price =
    await ethereumRpc.getEffectiveTransactionPriceByHash(
      batch.finalize_tx_hash!
    )

  const total_tx_effective_price = commit_tx_effective_price.plus(
    finalize_tx_effective_price
  )
  const total_tx_effective_unit_price = total_tx_effective_price
    .dividedBy(batch.total_tx_num)
    .decimalPlaces(0)

  return {
    batch_id: batch.id,
    commit_tx_effective_price: commit_tx_effective_price.toString(),
    finalize_tx_effective_price: finalize_tx_effective_price.toString(),
    total_tx_effective_price: total_tx_effective_price.toString(),
    total_tx_effective_unit_price: total_tx_effective_unit_price.toString(),
  }
}

function getBatchesReceipts(batchesArray: Array<BatchForReceipt>) {
  return Promise.all(batchesArray.map(getBatchReceipt))
}

function insertBatchReceipts(
  batchReceiptsValues: Array<typeof scrollBatchReceipts.$inferInsert>
) {
  return db
    .insert(scrollBatchReceipts)
    .values(batchReceiptsValues)
    .onConflictDoNothing()
}

export async function syncBatchReceipts() {
  logger.info(LOGGER_TAG, 'syncing batch receipts...')

  const batchesWithoutReceipts = (await getBatchesWithoutReceipt()).filter(
    (item) => item.rollup_status === 'finalized'
  )

  logger.info(
    LOGGER_TAG,
    `found ${batchesWithoutReceipts.length} batches without receipt`
  )

  for (let i = 0; i < batchesWithoutReceipts.length; i += CHUNK_SIZE) {
    logger.info(LOGGER_TAG, `processing batch ${i} - ${i + CHUNK_SIZE}...`)
    const batchReceiptsValues = await getBatchesReceipts(
      batchesWithoutReceipts.slice(i, i + CHUNK_SIZE)
    )

    logger.info(LOGGER_TAG, `inserting batch ${i} - ${i + CHUNK_SIZE}...`)
    await insertBatchReceipts(batchReceiptsValues)
  }

  if (batchesWithoutReceipts.length === BATCHES_LIMIT) {
    logger.info(LOGGER_TAG, `reached limit, continue in next run`)
    return syncBatchReceipts()
  }

  logger.info(LOGGER_TAG, 'done syncing batch receipts')
}
