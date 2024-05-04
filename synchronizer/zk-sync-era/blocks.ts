import { zkSyncEraBlocks } from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import type { ZkSyncEraRpcBlock } from '@zk-dashboard/common/integrations/zk-sync-era/rpc'
import { zkSyncEraRpc } from '@zk-dashboard/common/integrations/zk-sync-era/rpc'
import { logger } from '@zk-dashboard/common/lib/logger'

import { createBlocksSynchronizer } from '../common/blocks'
import { MAX_DATA_AGE_IN_DAYS } from '../common/constants'
import { LOGGER_CONFIG } from './constants'

const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.blocks,
}
/**
 * When searching for the oldest batch, this specifies the span (step) between the batches to look for.
 */
const ENTITY_NUMBER_SPAN = 10_000
/**
 * Number of blocks fetched and inserted at once
 */
const BLOCKS_CHUNK_SIZE = 200
/**
 * Number of blocks to get at once
 */
const MAX_BLOCKS_TO_GET = 1_000

async function insertBlocks(blocksInput: Array<ZkSyncEraRpcBlock>) {
  logger.info(
    LOGGER_TAG,
    `inserting blocks from ${blocksInput[0]?.number} ${blocksInput[blocksInput.length - 1]?.number}`
  )

  const values = blocksInput.map((block) => ({
    number: block.number,
    hash: block.hash,
    parent_hash: block.parentHash,
    nonce: block.nonce,
    sha3_uncles: block.sha3Uncles,
    logs_bloom: block.logsBloom,
    transactions_root: block.transactionsRoot,
    state_root: block.stateRoot,
    receipts_root: block.receiptsRoot,
    miner: block.miner,
    difficulty: block.difficulty,
    total_difficulty: block.totalDifficulty,
    size: block.size,
    extra_data: block.extraData,
    gas_limit: block.gasLimit,
    gas_used: block.gasUsed,
    timestamp: block.timestamp,
    // zkSyncEra has some blocks without transactions (e.g. block number 19567604)
    // API omits the field instead of returning an empty array
    transactions: (block.transactions as Array<string>) ?? [],
    uncles: block.uncles,
    mix_hash: block.mixHash,
    base_fee_per_gas: block.baseFeePerGas,
  }))

  return db.insert(zkSyncEraBlocks).values(values).onConflictDoNothing()
}

export const syncBlocks = createBlocksSynchronizer({
  blocksChunkSize: BLOCKS_CHUNK_SIZE,
  entityNumberSpan: ENTITY_NUMBER_SPAN,
  getBlock: zkSyncEraRpc.getBlock,
  insertBlocks,
  loggerTag: LOGGER_TAG,
  maxBlocksToGet: MAX_BLOCKS_TO_GET,
  maxDataAgeInDays: MAX_DATA_AGE_IN_DAYS,
  table: zkSyncEraBlocks,
})
