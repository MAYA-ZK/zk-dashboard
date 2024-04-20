import {
  bigint,
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

/**
 * Do not use database schemas to group tables.
 * Drizzle docs says: "You can’t create tables with the same name in different schemas".
 * https://orm.drizzle.team/kit-docs/faq#using-multiple-schemas-in-postgresql
 */

// ------------------ SCROLL TABLES ------------------
export const scrollBlocks = pgTable(
  'scroll_blocks',
  {
    id: serial('id').primaryKey(),

    base_fee_per_gas: bigint('base_fee_per_gas', { mode: 'bigint' }),
    difficulty: bigint('difficulty', { mode: 'bigint' }),
    extra_data: varchar('extra_data').notNull(),
    gas_limit: bigint('gas_limit', { mode: 'bigint' }).notNull(),
    gas_used: bigint('gas_used', { mode: 'bigint' }).notNull(),
    hash: varchar('hash'),
    logs_bloom: varchar('logs_bloom'),
    miner: varchar('miner').notNull(),
    mix_hash: varchar('mix_hash').notNull(),
    nonce: bigint('nonce', { mode: 'bigint' }).notNull(),
    number: bigint('number', { mode: 'bigint' }).notNull().unique(),
    parent_hash: varchar('parent_hash').notNull(),
    receipts_root: varchar('receipts_root').notNull(),
    sha3_uncles: varchar('sha3_uncles').notNull(),
    size: bigint('size', { mode: 'bigint' }).notNull(),
    state_root: varchar('state_root').notNull(),
    timestamp: timestamp('timestamp').notNull(),
    total_difficulty: bigint('total_difficulty', { mode: 'bigint' }).notNull(),
    transactions_root: varchar('transactions_root').notNull(),
    transactions: varchar('transactions').array().notNull(),
    uncles: varchar('uncles').array().notNull(),
  },
  (table) => {
    return {
      numberIndex: uniqueIndex('scroll_blocks_number_index').on(table.number),
      timestampIndex: index('scroll_blocks_timestamp_index').on(
        table.timestamp
      ),
    }
  }
)
export type ScrollBlock = typeof scrollBlocks.$inferSelect

export const scrollBatches = pgTable(
  'scroll_batches',
  {
    id: serial('id').primaryKey(),

    number: integer('number').unique(),
    hash: varchar('hash'),
    rollup_status: varchar('rollup_status'),
    timestamp: timestamp('timestamp'),

    total_tx_num: integer('total_tx_num').notNull(),
    commit_tx_hash: varchar('commit_tx_hash'),
    finalize_tx_hash: varchar('finalize_tx_hash'),

    committed_at: timestamp('committed_at'),
    end_block_number: integer('end_block_number'),
    end_chunk_hash: varchar('end_chunk_hash'),
    end_chunk_index: integer('end_chunk_index'),
    finalized_at: timestamp('finalized_at'),
    start_block_number: integer('start_block_number'),
    start_chunk_hash: varchar('start_chunk_hash'),
    start_chunk_index: integer('start_chunk_index'),
  },
  (table) => {
    return {
      indexIndex: uniqueIndex('scroll_batches_number_index').on(table.number),
    }
  }
)
export type ScrollBatch = typeof scrollBatches.$inferSelect

export const scrollBatchReceipts = pgTable(
  'scroll_batch_receipts',
  {
    id: serial('id').primaryKey(),
    batch_id: integer('batch_id')
      .references(() => scrollBatches.id, { onDelete: 'cascade' })
      .notNull(),
    commit_tx_effective_price: numeric('commit_tx_effective_price'),
    finalize_tx_effective_price: numeric('finalize_tx_effective_price'),

    total_tx_effective_price: numeric('total_tx_effective_price'),
    total_tx_effective_unit_price: numeric('total_tx_effective_unit_price'),
  },
  (table) => {
    return {
      batchIdIndex: uniqueIndex('scroll_batch_receipts_batch_id_index').on(
        table.batch_id
      ),
    }
  }
)
export type ScrollBatchReceipt = typeof scrollBatchReceipts.$inferSelect

// ------------------ ZK_SYNC_ERA TABLES ------------------

export const zkSyncEraBlocks = pgTable(
  'zk_sync_era_blocks',
  {
    id: serial('id').primaryKey(),

    base_fee_per_gas: bigint('base_fee_per_gas', { mode: 'bigint' }),
    difficulty: bigint('difficulty', { mode: 'bigint' }),
    extra_data: varchar('extra_data').notNull(),
    gas_limit: bigint('gas_limit', { mode: 'bigint' }).notNull(),
    gas_used: bigint('gas_used', { mode: 'bigint' }).notNull(),
    hash: varchar('hash'),
    logs_bloom: varchar('logs_bloom'),
    miner: varchar('miner').notNull(),
    mix_hash: varchar('mix_hash').notNull(),
    nonce: bigint('nonce', { mode: 'bigint' }).notNull(),
    number: bigint('number', { mode: 'bigint' }).notNull().unique(),
    parent_hash: varchar('parent_hash').notNull(),
    receipts_root: varchar('receipts_root').notNull(),
    sha3_uncles: varchar('sha3_uncles').notNull(),
    size: bigint('size', { mode: 'bigint' }).notNull(),
    state_root: varchar('state_root').notNull(),
    timestamp: timestamp('timestamp').notNull(),
    total_difficulty: bigint('total_difficulty', { mode: 'bigint' }).notNull(),
    transactions_root: varchar('transactions_root').notNull(),
    transactions: varchar('transactions').array().notNull(),
    uncles: varchar('uncles').array().notNull(),
  },
  (table) => {
    return {
      numberIndex: uniqueIndex('zk_sync_era_blocks_number_index').on(
        table.number
      ),
      timestampIndex: index('zk_sync_era_blocks_timestamp_index').on(
        table.timestamp
      ),
    }
  }
)
export type ZkSyncEraBlock = typeof zkSyncEraBlocks.$inferSelect

export const zkSyncEraBatches = pgTable(
  'zk_sync_era_batches',
  {
    id: serial('id').primaryKey(),

    number: bigint('number', { mode: 'bigint' }).notNull().unique(),
    timestamp: timestamp('timestamp').notNull(),
    status: varchar('status').notNull(),
    commit_tx_hash: varchar('commit_tx_hash').notNull(),
    committed_at: timestamp('committed_at').notNull(),
    execute_tx_hash: varchar('execute_tx_hash').notNull(),
    executed_at: timestamp('executed_at').notNull(),
    prove_tx_hash: varchar('prove_tx_hash').notNull(),
    proven_at: timestamp('proven_at').notNull(),
    l1_gas_price: bigint('l1_gas_price', { mode: 'bigint' }).notNull(),
    l1_tx_count: integer('l1_tx_count').notNull(),
    l2_fair_gas_price: bigint('l2_fair_gas_price', {
      mode: 'bigint',
    }).notNull(),
    l2_tx_count: integer('l2_tx_count').notNull(),
    root_hash: varchar('root_hash').notNull(),
    base_system_contracts_hashes_bootloader: varchar(
      'base_system_contracts_hashes_bootloader'
    ).notNull(),
    base_system_contracts_hashes_default_aa: varchar(
      'base_system_contracts_hashes_default_aa'
    ).notNull(),
  },
  (table) => {
    return {
      numberIndex: uniqueIndex('zk_sync_era_batches_number_index').on(
        table.number
      ),
    }
  }
)
export type ZkSyncEraBatch = typeof zkSyncEraBatches.$inferSelect

export const zkSyncEraBatchReceipts = pgTable(
  'zk_sync_era_batch_receipts',
  {
    id: serial('id').primaryKey(),
    batch_id: integer('batch_id')
      .references(() => zkSyncEraBatches.id, { onDelete: 'cascade' })
      .notNull(),
    commit_tx_fee: bigint('commit_tx_fee', { mode: 'bigint' }),
    proven_tx_fee: bigint('proven_tx_fee', { mode: 'bigint' }),
    execute_tx_fee: bigint('execute_tx_fee', { mode: 'bigint' }),
    total_tx_fee: bigint('total_tx_fee', { mode: 'bigint' }),
    total_tx_fee_per_unit: bigint('total_tx_fee_per_unit', { mode: 'bigint' }),
  },
  (table) => {
    return {
      batchIndex: uniqueIndex('zk_sync_era_batch_receipts_batch_id_index').on(
        table.batch_id
      ),
    }
  }
)

// ------------------ POLYGON_ZK_EVM TABLES ------------------

export const polygonZkEvmBlocks = pgTable(
  'polygon_zk_evm_blocks',
  {
    id: serial('id').primaryKey(),

    difficulty: bigint('difficulty', { mode: 'bigint' }),
    extra_data: varchar('extra_data').notNull(),
    gas_limit: bigint('gas_limit', { mode: 'bigint' }).notNull(),
    gas_used: bigint('gas_used', { mode: 'bigint' }).notNull(),
    hash: varchar('hash'),
    logs_bloom: varchar('logs_bloom'),
    miner: varchar('miner').notNull(),
    mix_hash: varchar('mix_hash').notNull(),
    nonce: bigint('nonce', { mode: 'bigint' }).notNull(),
    number: bigint('number', { mode: 'bigint' }).notNull().unique(),
    parent_hash: varchar('parent_hash').notNull(),
    receipts_root: varchar('receipts_root').notNull(),
    sha3_uncles: varchar('sha3_uncles').notNull(),
    size: bigint('size', { mode: 'bigint' }).notNull(),
    state_root: varchar('state_root').notNull(),
    timestamp: timestamp('timestamp').notNull(),
    transactions_root: varchar('transactions_root').notNull(),
    transactions: varchar('transactions').array().notNull(),
    uncles: varchar('uncles').array().notNull(),
  },
  (table) => {
    return {
      numberIndex: uniqueIndex('polygon_zk_evm_blocks_number_index').on(
        table.number
      ),
      timestampIndex: index('polygon_zk_evm_blocks_timestamp_index').on(
        table.timestamp
      ),
    }
  }
)
export type PolygonZkEvmBlock = typeof polygonZkEvmBlocks.$inferSelect

export const polygonZkEvmBatches = pgTable(
  'polygon_zk_evm_batches',
  {
    id: serial('id').primaryKey(),

    number: bigint('number', { mode: 'bigint' }).notNull().unique(),
    timestamp: timestamp('timestamp').notNull(),
    send_sequences_tx_hash: varchar('send_sequences_tx_hash').notNull(),
    sent_at: timestamp('sent_at'),
    verify_batch_tx_hash: varchar('verify_batch_tx_hash').notNull(),
    verified_at: timestamp('verified_at'),
    acc_input_hash: varchar('acc_input_hash').notNull(),
    blocks: varchar('blocks').array().notNull(),
    transactions: varchar('transactions').array().notNull(),
    closed: boolean('closed').notNull(),
    coinbase: varchar('coinbase').notNull(),
    global_exit_root: varchar('global_exit_root').notNull(),
    local_exit_root: varchar('local_exit_root').notNull(),
    mainnet_exit_root: varchar('mainnet_exit_root').notNull(),
    rollup_exit_root: varchar('rollup_exit_root').notNull(),
    state_root: varchar('state_root').notNull(),
  },
  (table) => {
    return {
      numberIndex: uniqueIndex('polygon_zk_evm_batches_number_index').on(
        table.number
      ),
    }
  }
)
export type PolygonZkEvaBatch = typeof polygonZkEvmBatches.$inferSelect

export const polygonZkEvmBatchReceipts = pgTable(
  'polygon_zk_evm_batch_receipts',
  {
    id: serial('id').primaryKey(),
    batch_id: integer('batch_id')
      .references(() => polygonZkEvmBatches.id, { onDelete: 'cascade' })
      .notNull(),
    // gas used * effective gas price
    send_sequences_tx_fee: bigint('send_sequences_tx_fee', { mode: 'bigint' }),
    // gas used * effective gas price
    verify_batch_tx_fee: bigint('verify_batch_tx_fee', { mode: 'bigint' }),
    total_tx_fee: bigint('total_tx_fee', { mode: 'bigint' }),
    total_tx_fee_per_unit: bigint('total_tx_fee_per_unit', { mode: 'bigint' }),
  },
  (table) => {
    return {
      batchIdIndex: uniqueIndex(
        'polygon_zk_evm_batch_receipts_batch_id_index'
      ).on(table.batch_id),
    }
  }
)

// ------------------ ETH-USD Price over time ------------------

export const ethUsdPrice = pgTable('eth_usd_price', {
  id: serial('id').primaryKey(),
  // yyyy-MM-dd
  date: timestamp('date').notNull().unique(),
  // in cents
  price: integer('price').notNull(),
})

// ------------------ Linea transactions ------------------

// blockNumber: z.string(),
// timeStamp: z.string(),
// hash: z.string(),
// nonce: z.string(),
// blockHash: z.string(),
// transactionIndex: z.string(),
// from: z.string(),
// to: z.string(),
// value: z.string(),
// gas: z.string(),
// gasPrice: z.string(),
// isError: z.string(),
// txreceipt_status: z.string(),
// input: z.string(),
// contractAddress: z.string(),
// cumulativeGasUsed: z.string(),
// gasUsed: z.string(),
// confirmations: z.string(),
// methodId: z.string(),
// functionName: z.string(),

export const lineaTransactions = pgTable('linea_transactions', {
  id: serial('id').primaryKey(),
  blockNumber: varchar('blockNumber'),
  timeStamp: varchar('timeStamp'),
  hash: varchar('hash'),
  nonce: varchar('nonce'),
  blockHash: varchar('blockHash'),
  transactionIndex: varchar('transactionIndex'),
  from: varchar('from'),
  to: varchar('to'),
  value: varchar('value'),
  gas: varchar('gas'),
  gasPrice: varchar('gasPrice'),
  isError: varchar('isError'),
  txreceipt_status: varchar('txreceipt_status'),
  input: varchar('input'),
  contractAddress: varchar('contractAddress'),
  cumulativeGasUsed: varchar('cumulativeGasUsed'),
  gasUsed: varchar('gasUsed'),
  confirmations: varchar('confirmations'),
  methodId: varchar('methodId'),
  functionName: varchar('functionName'),
})

// {
//   address: '0xd19d4b5d358258f05d7b411e21a1460d11b0876f',
//   topics: [
//     '0x5c885a794662ebe3b08ae0874fc2c88b5343b0223ba9cd2cad92b69c0d0c901f',
//     '0x000000000000000000000000000000000000000000000000000000000039b567'
//   ],
//   data: '0x10dce6e965a38927fa4462c27ae551db27e2c539eacc873dc3f4159666f4fec30f51a2da5a0adc1fdae489e084b7964b8fc665925996aa571f071f388ce96627',
//   blockNumber: 19680260n,
//   transactionHash: '0xb0c8923049101270b3251bf7f7e8202be7e4ac790c76c8ea7f5880ce34aca83a',
//   transactionIndex: 93n,
//   blockHash: '0x193c4d74e8a8f2ce2899a3a857713489e57559bb32675ec4a0c3fc1f33f32924',
//   logIndex: 161n,
//   removed: false
// }
export const lineTxLogs = pgTable('line_tx_logs', {
  id: serial('id').primaryKey(),
  address: varchar('address'),
  topics: varchar('topics').array(),
  data: varchar('data'),
  block_number: bigint('block_number', { mode: 'bigint' }),
  transaction_hash: varchar('transaction_hash'),
  transaction_index: bigint('transaction_index', { mode: 'bigint' }),
  block_hash: varchar('block_hash'),
  log_index: bigint('log_index', { mode: 'bigint' }),
  removed: boolean('removed'),
})
