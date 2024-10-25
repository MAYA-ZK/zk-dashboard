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
    nonce: numeric('nonce').notNull(),
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

// ------------------ LINEA TABLES ------------------

export const lineaTransactions = pgTable('linea_transactions', {
  id: serial('id').primaryKey(),
  block_number: bigint('block_number', { mode: 'bigint' }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  hash: varchar('hash').notNull(),
  nonce: bigint('nonce', { mode: 'bigint' }).notNull(),
  block_hash: varchar('block_hash').notNull(),
  transaction_index: integer('transaction_index').notNull(),
  from: varchar('from').notNull(),
  to: varchar('to').notNull(),
  value: numeric('value').notNull(),
  gas: bigint('gas', { mode: 'bigint' }).notNull(),
  gas_price: bigint('gas_price', { mode: 'bigint' }).notNull(),
  tx_receipt_status: varchar('tx_receipt_status'),
  input: varchar('input').notNull(),
  contract_address: varchar('contract_address').notNull(),
  cumulative_gas_used: bigint('cumulative_gas_used', {
    mode: 'bigint',
  }).notNull(),
  gas_used: bigint('gas_used', { mode: 'bigint' }).notNull(),
  confirmations: integer('confirmations'),
  method_id: varchar('methodId').notNull(),
  function_name: varchar('function_name').notNull(),
  decoded_last_finalized_timestamp: timestamp(
    'decoded_last_finalized_timestamp'
  ),
  decoded_final_timestamp: timestamp('decoded_final_timestamp'),
  decoded_final_block_number: bigint('decoded_final_block_number', {
    mode: 'bigint',
  }),
})

export type LineaTransaction = typeof lineaTransactions.$inferSelect

export const lineaBlocks = pgTable(
  'linea_blocks',
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
    transactions_count: integer('transactions_count').notNull().default(0),
    uncles: varchar('uncles').array().notNull(),
  },
  (table) => {
    return {
      numberIndex: uniqueIndex('linea_blocks_number_index').on(table.number),
      timestampIndex: index('linea_blocks_timestamp_index').on(table.timestamp),
    }
  }
)
export type LineaBlock = typeof lineaBlocks.$inferSelect
