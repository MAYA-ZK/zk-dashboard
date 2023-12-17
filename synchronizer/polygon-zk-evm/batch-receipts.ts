import { eq, isNull } from 'drizzle-orm'
import _ from 'lodash'

import type { PolygonZkEvaBatch } from '@zk-dashboard/common/database/schema'
import {
  polygonZkEvmBatchReceipts,
  polygonZkEvmBatches,
} from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import type { EthereumTransactionReceipt } from '@zk-dashboard/common/integrations/ethereum/rpc'
import { ethereumRpc } from '@zk-dashboard/common/integrations/ethereum/rpc'
import { logger } from '@zk-dashboard/common/lib/logger'
import { calculateTransactionFee } from '@zk-dashboard/common/lib/transactions'

import { LOGGER_CONFIG } from './constants'

const BATCHES_LIMIT = 400
const CHUNK_SIZE = 20

const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.batchReceipts,
}

async function getBatchesWithoutReceipt() {
  return await db
    .select({
      id: polygonZkEvmBatches.id,
      verify_batch_tx_hash: polygonZkEvmBatches.verify_batch_tx_hash,
      send_sequences_tx_hash: polygonZkEvmBatches.send_sequences_tx_hash,
      transactions: polygonZkEvmBatches.transactions,
    })
    .from(polygonZkEvmBatches)
    .leftJoin(
      polygonZkEvmBatchReceipts,
      eq(polygonZkEvmBatches.id, polygonZkEvmBatchReceipts.batch_id)
    )
    .where(isNull(polygonZkEvmBatchReceipts.batch_id))
    .orderBy(polygonZkEvmBatches.number)
    .limit(BATCHES_LIMIT)
}

type BatchForReceipt = Pick<
  PolygonZkEvaBatch,
  'id' | 'transactions' | 'verify_batch_tx_hash' | 'send_sequences_tx_hash'
>

type BatchReceipt = {
  batch: BatchForReceipt
  verifyBatchTXReceipt: EthereumTransactionReceipt
  sendBatchTXReceipt: EthereumTransactionReceipt
}

async function getBatchReceipt(batch: BatchForReceipt) {
  const [verifyBatchTXReceipt, sendBatchTXReceipt] = await Promise.all([
    ethereumRpc.getTransactionReceipt(batch.verify_batch_tx_hash),
    ethereumRpc.getTransactionReceipt(batch.send_sequences_tx_hash),
  ])

  return {
    batch,
    verifyBatchTXReceipt,
    sendBatchTXReceipt,
  }
}

function getBatchReceiptFee({
  batch,
  verifyBatchTXReceipt,
  sendBatchTXReceipt,
}: {
  batch: BatchForReceipt
  verifyBatchTXReceipt: EthereumTransactionReceipt
  sendBatchTXReceipt: EthereumTransactionReceipt
}) {
  const verifyBatchTxFee = calculateTransactionFee(
    verifyBatchTXReceipt.gasUsed.toString(),
    verifyBatchTXReceipt.effectiveGasPrice?.toString() ?? '0'
  )
  const sendSequenceTxFee = calculateTransactionFee(
    sendBatchTXReceipt.gasUsed.toString(),
    sendBatchTXReceipt.effectiveGasPrice?.toString() ?? '0'
  )

  const totalTxFee = verifyBatchTxFee.plus(sendSequenceTxFee)
  const totalTxFeePerUnit =
    batch.transactions.length === 0
      ? 0
      : totalTxFee.div(batch.transactions.length).decimalPlaces(0)

  return {
    batch_id: batch.id,
    verify_batch_tx_fee: BigInt(verifyBatchTxFee.toString()),
    send_sequences_tx_fee: BigInt(sendSequenceTxFee.toString()),
    total_tx_fee: BigInt(totalTxFee.toString()),
    total_tx_fee_per_unit: BigInt(totalTxFeePerUnit.toString()),
  }
}

function getBatchesReceipts(batchesArray: Array<BatchForReceipt>) {
  return Promise.all(batchesArray.map(getBatchReceipt))
}

type BatchReceiptTimestamps = Awaited<
  ReturnType<typeof getTimestampsForBatchReceipt>
>

async function getTimestampsForBatchReceipt(batchReceipt: BatchReceipt) {
  const [sendBatchTXBlock, verifyBatchTXBlock] = await Promise.all([
    ethereumRpc.getBlock(batchReceipt.sendBatchTXReceipt.blockNumber),
    ethereumRpc.getBlock(batchReceipt.verifyBatchTXReceipt.blockNumber),
  ])

  return {
    batch: batchReceipt.batch,
    verifyBatchTxTimestamp: verifyBatchTXBlock.timestamp,
    sendSequencesTxTimestamp: sendBatchTXBlock.timestamp,
  }
}

async function getTimestampsForBatchReceipts(
  batchReceipts: Array<BatchReceipt>
) {
  // Some batches have the same send_sequences_tx_hash and verify_batch_tx_hash
  // so we group them by the hashes and then get the timestamps for each group.
  // That way we can save some RPC calls.
  const groupedBatchReceipts = Object.values(
    _.groupBy(
      batchReceipts,
      (batchReceipt) =>
        batchReceipt.batch.send_sequences_tx_hash +
        batchReceipt.batch.verify_batch_tx_hash
    )
  )

  const groupedTimestamps = await Promise.all(
    groupedBatchReceipts.map(async (batchReceiptGroup) => {
      const firstItem = batchReceiptGroup[0]
      if (!firstItem) {
        // this should never happen
        throw new Error('Batch timestamp group is empty')
      }

      const timestamp = await getTimestampsForBatchReceipt(firstItem)
      return batchReceiptGroup.map((batchReceipt) => ({
        batch: batchReceipt.batch,
        verifyBatchTxTimestamp: timestamp.verifyBatchTxTimestamp,
        sendSequencesTxTimestamp: timestamp.sendSequencesTxTimestamp,
      }))
    })
  )

  return groupedTimestamps.flat()
}

function insertBatchReceipts(
  batchReceiptsValues: Array<typeof polygonZkEvmBatchReceipts.$inferInsert>
) {
  return db
    .insert(polygonZkEvmBatchReceipts)
    .values(batchReceiptsValues)
    .onConflictDoNothing()
}

function updateBatchWithTransactionTimestamps({
  batch,
  verifyBatchTxTimestamp,
  sendSequencesTxTimestamp,
}: BatchReceiptTimestamps) {
  return db
    .update(polygonZkEvmBatches)
    .set({
      verified_at: verifyBatchTxTimestamp,
      sent_at: sendSequencesTxTimestamp,
    })
    .where(eq(polygonZkEvmBatches.id, batch.id))
}

function updateBatchesWithTransactionTimestamps(
  timestamps: Array<BatchReceiptTimestamps>
) {
  return Promise.all(timestamps.map(updateBatchWithTransactionTimestamps))
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

    const batchesReceipts = await getBatchesReceipts(
      batchesWithoutReceipts.slice(i, i + CHUNK_SIZE)
    )

    const timestamps = await getTimestampsForBatchReceipts(batchesReceipts)

    const batchesReceiptsValues = batchesReceipts.map((batchReceipt) => {
      return getBatchReceiptFee({
        batch: batchReceipt.batch,
        verifyBatchTXReceipt: batchReceipt.verifyBatchTXReceipt,
        sendBatchTXReceipt: batchReceipt.sendBatchTXReceipt,
      })
    })

    logger.info(LOGGER_TAG, `inserting chunk of batch receipts...`)
    await insertBatchReceipts(batchesReceiptsValues)
    logger.info(LOGGER_TAG, `updating batches with transaction timestamps...`)
    await updateBatchesWithTransactionTimestamps(timestamps)
  }

  if (batchesWithoutReceipts.length === BATCHES_LIMIT) {
    logger.info(
      LOGGER_TAG,
      `synced ${BATCHES_LIMIT} batches, continue in next run`
    )
    return syncBatchReceipts()
  }

  logger.info(LOGGER_TAG, 'done syncing batch receipts')
}
