import { sql } from 'drizzle-orm'
import {
  bigint,
  integer,
  interval,
  numeric,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

import { db } from '../utils'
import { period } from './common'
import { createPgMaterializedView } from './utils'

export const {
  materializedView: zkSyncEraBatchCostMv,
  createOrReplace: createOrReplaceZkSyncEraBatchCostMv,
} = createPgMaterializedView(
  'zk_sync_era_batch_cost_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    batch_num: bigint('batch_num', { mode: 'number' }).notNull(),
    batch_status: varchar('batch_status').notNull(),
    batch_verification: timestamp('batch_verification').notNull(),
    total_tx_count: bigint('total_tx_count', { mode: 'number' }).notNull(),
    commit_cost_eth: numeric('commit_cost_eth').notNull(),
    verification_cost_eth: numeric('verification_cost_eth').notNull(),
    execute_cost_eth: numeric('execute_cost_eth').notNull(),
    batch_total_cost_eth: numeric('batch_total_cost_eth').notNull(),
    batch_txs_recorded_divided_eth: numeric(
      'batch_txs_recorded_divided_eth'
    ).notNull(),
    highest_total_cost_eth: numeric('highest_total_cost_eth').notNull(),
    average_total_cost_eth: numeric('average_total_cost_eth').notNull(),
    lowest_total_cost_eth: numeric('lowest_total_cost_eth').notNull(),
    cumulative_cost_eth: numeric('cumulative_cost_eth').notNull(),
    est_commit_cost_usd: numeric('est_commit_cost_usd').notNull(),
    est_verification_cost_usd: numeric('est_verification_cost_usd').notNull(),
    est_execute_cost_usd: numeric('est_execute_cost_usd').notNull(),
    est_batch_total_cost_usd: numeric('est_batch_total_cost_usd').notNull(),
    avg_est_batch_total_cost_daily_usd: numeric(
      'avg_est_batch_total_cost_daily_usd'
    ).notNull(),
    est_batch_txs_recorded_divided_usd: numeric(
      'est_batch_txs_recorded_divided_usd'
    ).notNull(),
    est_batch_cumulative_cost_usd: numeric(
      'est_batch_cumulative_cost_usd'
    ).notNull(),
    batch_link: text('batch_link').notNull(),
  },
  sql`
    WITH
      batch_costs AS (
        SELECT
          batch_id,
          commit_tx_fee / 1e18 as commit_tx_fee_eth,
          proven_tx_fee / 1e18 as verification_tx_fee_eth,
          execute_tx_fee / 1e18 as execute_tx_fee_eth,
          total_tx_fee / 1e18 as total_tx_fee_eth,
          total_tx_fee_per_unit / 1e18 as total_tx_fee_per_unit_eth
        FROM
          zk_sync_era_batch_receipts
      ),
      txs_count AS (
        SELECT
          "number" as batch_num,
          SUM(l1_tx_count + l2_tx_count) AS txs_total
        FROM
          zk_sync_era_batches
        GROUP BY
          1
      ),
      aggregates AS (
        SELECT
          MAX(total_tx_fee) / 1e18 as max_cost_eth,
          AVG(total_tx_fee) / 1e18 as avg_cost_eth,
          MIN(total_tx_fee) / 1e18 as min_cost_eth
        FROM
          zk_sync_era_batch_receipts
      ),
      daily_avg_cost AS (
        SELECT
          date_trunc('day', zb.executed_at) AS day,
          AVG(bc.total_tx_fee_eth * (ep.price / 100.0)) AS avg_daily_cost_usd
        FROM
          zk_sync_era_batches zb
          JOIN batch_costs bc ON zb.id = bc.batch_id
          JOIN eth_usd_price ep ON date_trunc('day', zb.executed_at) = date_trunc('day', ep."date")
        GROUP BY
          day
      )
    SELECT
      '324'::INTEGER as chain_id,
      'zksync era' as blockchain,
      zb."number" as batch_num,
      CASE
        WHEN zb.status = 'verified' THEN 'finalized'
        ELSE zb.status
      END as batch_status,
      zb.executed_at as batch_verification,
      tc.txs_total as total_tx_count,
      bc.commit_tx_fee_eth as commit_cost_eth,
      bc.verification_tx_fee_eth as verification_cost_eth,
      bc.execute_tx_fee_eth as execute_cost_eth,
      bc.total_tx_fee_eth as batch_total_cost_eth,
      bc.total_tx_fee_per_unit_eth as batch_txs_recorded_divided_eth,
      ag.max_cost_eth as highest_total_cost_eth,
      ag.avg_cost_eth as average_total_cost_eth,
      ag.min_cost_eth as lowest_total_cost_eth,
      SUM(bc.total_tx_fee_eth) OVER (
        ORDER BY
          zb.executed_at
      ) as cumulative_cost_eth,
      ROUND((ep.price / 100.0) * bc.commit_tx_fee_eth, 2) as est_commit_cost_usd,
      ROUND(
        (ep.price / 100.0) * bc.verification_tx_fee_eth,
        2
      ) as est_verification_cost_usd,
      ROUND((ep.price / 100.0) * bc.execute_tx_fee_eth, 2) as est_execute_cost_usd,
      ROUND((ep.price / 100.0) * bc.total_tx_fee_eth, 2) as est_batch_total_cost_usd,
      ROUND(dac.avg_daily_cost_usd, 2) as avg_est_batch_total_cost_daily_usd,
      ROUND(
        (ep.price / 100.0) * bc.total_tx_fee_per_unit_eth,
        2
      ) as est_batch_txs_recorded_divided_usd,
      ROUND(
        (ep.price / 100.0) * SUM(bc.total_tx_fee_eth) OVER (
          ORDER BY
            zb.executed_at
        ),
        2
      ) as est_batch_cumulative_cost_usd,
      'https://explorer.zksync.io/batch/' || zb."number"::text as batch_link
    FROM
      zk_sync_era_batches zb
      JOIN batch_costs bc ON zb.id = bc.batch_id
      JOIN eth_usd_price ep ON date_trunc('day', zb.executed_at) = date_trunc('day', ep."date")
      JOIN daily_avg_cost dac ON date_trunc('day', zb.executed_at) = dac.day
      JOIN txs_count tc ON zb."number" = tc.batch_num,
      LATERAL (
        SELECT
          *
        FROM
          aggregates
      ) ag
    WHERE
      zb.executed_at IS NOT NULL
      AND zb.executed_at < DATE_TRUNC('day', CURRENT_DATE)
    ORDER BY
      zb."number" DESC;
  `
)
export const {
  materializedView: zkSyncEraBatchFinalityMv,
  createOrReplace: createOrReplaceZkSyncEraBatchFinalityMv,
} = createPgMaterializedView(
  'zk_sync_era_batch_finality_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    batch_num: bigint('batch_num', { mode: 'number' }).notNull(),
    batch_status: varchar('batch_status').notNull(),
    batch_created: timestamp('batch_created').notNull(),
    batch_committed: timestamp('batch_committed').notNull(),
    batch_verified: timestamp('batch_verified').notNull(),
    executed_proven: timestamp('executed_proven').notNull(),
    batch_time_duration: interval('batch_time_duration').notNull(),
    daily_max_duration: interval('daily_max_duration').notNull(),
    daily_avg_duration: interval('daily_avg_duration').notNull(),
    daily_min_duration: interval('daily_min_duration').notNull(),
    batch_link: text('batch_link').notNull(),
  },
  sql`
    WITH
      batch_finality AS (
        SELECT
          id,
          DATE_TRUNC('second', executed_at) - DATE_TRUNC('second', "timestamp") AS duration
        FROM
          zk_sync_era_batches
        WHERE
          executed_at IS NOT NULL
          AND "timestamp" IS NOT NULL
          AND executed_at < DATE_TRUNC('day', CURRENT_DATE)
        ORDER BY
          "timestamp" ASC
      ),
      aggregates AS (
        SELECT
          MAX(duration) AS daily_max_duration,
          AVG(duration) AS daily_avg_duration,
          MIN(duration) AS daily_min_duration
        FROM
          batch_finality
      )
    SELECT
      '324'::INTEGER AS chain_id,
      'zksync era' AS blockchain,
      zb."number" AS batch_num,
      CASE
        WHEN zb.status = 'verified' THEN 'finalized'
        ELSE zb.status
      END AS batch_status,
      DATE_TRUNC('second', zb."timestamp") AS batch_created,
      DATE_TRUNC('second', zb.committed_at) AS batch_committed,
      DATE_TRUNC('second', zb.proven_at) AS batch_verified,
      DATE_TRUNC('second', zb.executed_at) AS executed_proven,
      DATE_TRUNC('second', zb.executed_at) - DATE_TRUNC('second', zb."timestamp") AS batch_time_duration,
      agg.daily_max_duration,
      agg.daily_avg_duration,
      agg.daily_min_duration,
      'https://explorer.zksync.io/batch/' || zb."number"::text AS batch_link
    FROM
      zk_sync_era_batches zb
      JOIN aggregates agg ON TRUE
    WHERE
      zb.executed_at IS NOT NULL
      AND zb."timestamp" IS NOT NULL
      AND zb.executed_at < DATE_TRUNC('day', CURRENT_DATE)
    ORDER BY
      zb."number" DESC;
  `
)
export const {
  materializedView: zkSyncEraBatchCreatedMv,
  createOrReplace: createOrReplaceZkSyncEraBatchCreatedMv,
} = createPgMaterializedView(
  'zk_sync_era_batch_created_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    tx_date: timestamp('tx_date').notNull(),
    batch_count: bigint('batch_count', { mode: 'number' }).notNull(),
    batch_count_committed: bigint('batch_count_committed', {
      mode: 'number',
    }).notNull(),
    batch_count_verified: bigint('batch_count_verified', {
      mode: 'number',
    }).notNull(),
    avg_blocks_per_batch: bigint('avg_blocks_per_batch', {
      mode: 'number',
    }).notNull(),
    avg_txs_per_batch: bigint('avg_txs_per_batch', {
      mode: 'number',
    }).notNull(),
  },
  sql`
    WITH
      batches as (
        SELECT
          date_trunc('day', executed_at) as tx_date,
          count("number") as batch_count,
          count(
            CASE
              WHEN commit_tx_hash IS NOT NULL THEN "number"
            END
          ) as batch_count_committed,
          count(
            CASE
              WHEN executed_at IS NOT NULL THEN "number"
            END
          ) as batch_count_verified
        FROM
          zk_sync_era_batches
        WHERE
          executed_at < date_trunc('day', CURRENT_DATE)
        GROUP BY
          1
      ),
      batched_blocks as (
        SELECT
          date_trunc('day', "timestamp") as tx_date,
          count(*) as block_count,
          sum(cardinality(transactions)) as txs_total
        FROM
          zk_sync_era_blocks
        WHERE
          "timestamp" < date_trunc('day', CURRENT_DATE)
        GROUP BY
          1
      ),
      averages AS (
        SELECT
          b.tx_date,
          b.batch_count,
          b.batch_count_committed,
          b.batch_count_verified,
          bb.block_count / NULLIF(b.batch_count, 0) as avg_blocks_per_batch,
          bb.txs_total / NULLIF(b.batch_count, 0) as avg_txs_per_batch
        FROM
          batches b
          LEFT JOIN batched_blocks bb ON b.tx_date = bb.tx_date
      )
    SELECT
      '324'::INTEGER as chain_id,
      'zksync era' as blockchain,
      tx_date,
      batch_count,
      batch_count_committed,
      batch_count_verified,
      avg_blocks_per_batch,
      avg_txs_per_batch
    FROM
      averages
    ORDER BY
      tx_date DESC;
  `
)

export const {
  materializedView: zkSyncEraBatchAvgCostMv,
  createOrReplace: createOrReplaceZkSyncEraBatchAvgCostMv,
} = createPgMaterializedView(
  'zk_sync_era_batch_avg_cost_mv',
  {
    tx_date: timestamp('tx_date').notNull(),
    avg_commit_cost_usd: numeric('avg_commit_cost_usd').notNull(),
    avg_verification_cost_usd: numeric('avg_verification_cost_usd').notNull(),
  },
  sql`
    SELECT
      DATE_TRUNC('day', batch_verification) AS tx_date,
      AVG(est_commit_cost_usd) AS avg_commit_cost_usd,
      AVG(est_verification_cost_usd) AS avg_verification_cost_usd
    FROM
      zk_sync_era_batch_cost_mv
    GROUP BY
      DATE_TRUNC('day', batch_verification)
    ORDER BY
      tx_date DESC;
  `
)

// TODO: Check if this will be used in the future or can be removed
export const {
  materializedView: zkSyncEraAvgCostOfBatchesDateRange,
  createOrReplace: createOrReplaceZkSyncEraAvgCostOfBatchesDateRange,
} = createPgMaterializedView(
  'zk_sync_era_avg_cost_of_batches_date_range',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_txs_inside_a_batch: numeric('avg_txs_inside_a_batch').notNull(),
    avg_commit_cost_eth: numeric('avg_commit_cost_eth').notNull(),
    avg_verification_cost_eth: numeric('avg_verification_cost_eth').notNull(),
    avg_total_proof_cost_eth: numeric('avg_total_proof_cost_eth').notNull(),
    avg_execute_cost_eth: numeric('avg_execute_cost_eth').notNull(),
    avg_total_cost_eth: numeric('avg_total_cost_eth').notNull(),
    avg_commit_cost_usd: numeric('avg_commit_cost_usd').notNull(),
    avg_verification_cost_usd: numeric('avg_verification_cost_usd').notNull(),
    avg_est_execute_cost_usd: numeric('avg_est_execute_cost_usd').notNull(),
    avg_total_proof_cost_usd: numeric('avg_total_proof_cost_usd').notNull(),
    avg_total_cost_usd: numeric('avg_total_cost_usd').notNull(),
  },
  sql`
    WITH
      date_range AS (
        SELECT
          '7_days' AS period,
          MIN(batch_verification) AS start_date,
          MAX(batch_verification) AS end_date,
          AVG(total_tx_count) AS avg_txs_inside_a_batch,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(verification_cost_eth) AS avg_verification_cost_eth,
          AVG(execute_cost_eth) AS avg_execute_cost_eth,
          AVG(commit_cost_eth + verification_cost_eth) AS avg_total_proof_cost_eth,
          AVG(batch_total_cost_eth) AS avg_total_cost_eth,
          AVG(est_commit_cost_usd) AS avg_commit_cost_usd,
          AVG(est_verification_cost_usd) AS avg_verification_cost_usd,
          AVG(est_execute_cost_usd) AS avg_est_execute_cost_usd,
          AVG(est_commit_cost_usd + est_verification_cost_usd) AS avg_total_proof_cost_usd,
          AVG(est_batch_total_cost_usd) AS avg_total_cost_usd
        FROM
          zk_sync_era_batch_cost_mv
        WHERE
          batch_verification >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(batch_verification) AS start_date,
          MAX(batch_verification) AS end_date,
          AVG(total_tx_count) AS avg_txs_inside_a_batch,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(verification_cost_eth) AS avg_verification_cost_eth,
          AVG(execute_cost_eth) AS avg_execute_cost_eth,
          AVG(commit_cost_eth + verification_cost_eth) AS avg_total_proof_cost_eth,
          AVG(batch_total_cost_eth) AS avg_total_cost_eth,
          AVG(est_commit_cost_usd) AS avg_commit_cost_usd,
          AVG(est_verification_cost_usd) AS avg_verification_cost_usd,
          AVG(est_execute_cost_usd) AS avg_est_execute_cost_usd,
          AVG(est_commit_cost_usd + est_verification_cost_usd) AS avg_total_proof_cost_usd,
          AVG(est_batch_total_cost_usd) AS avg_total_cost_usd
        FROM
          zk_sync_era_batch_cost_mv
        WHERE
          batch_verification >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(batch_verification) AS start_date,
          MAX(batch_verification) AS end_date,
          AVG(total_tx_count) AS avg_txs_inside_a_batch,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(verification_cost_eth) AS avg_verification_cost_eth,
          AVG(execute_cost_eth) AS avg_execute_cost_eth,
          AVG(commit_cost_eth + verification_cost_eth) AS avg_total_proof_cost_eth,
          AVG(batch_total_cost_eth) AS avg_total_cost_eth,
          AVG(est_commit_cost_usd) AS avg_commit_cost_usd,
          AVG(est_verification_cost_usd) AS avg_verification_cost_usd,
          AVG(est_execute_cost_usd) AS avg_est_execute_cost_usd,
          AVG(est_commit_cost_usd + est_verification_cost_usd) AS avg_total_proof_cost_usd,
          AVG(est_batch_total_cost_usd) AS avg_total_cost_usd
        FROM
          zk_sync_era_batch_cost_mv
        WHERE
          batch_verification >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '324'::INTEGER as chain_id,
      'zksync era' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      avg_txs_inside_a_batch,
      avg_commit_cost_eth,
      avg_verification_cost_eth,
      avg_total_proof_cost_eth,
      avg_execute_cost_eth,
      avg_total_cost_eth,
      avg_commit_cost_usd,
      avg_verification_cost_usd,
      avg_est_execute_cost_usd,
      avg_total_proof_cost_usd,
      avg_total_cost_usd
    FROM
      date_range
    ORDER BY
      CASE
        WHEN period = '7_days' THEN 1
        WHEN period = '30_days' THEN 2
        WHEN period = '90_days' THEN 3
      END;
  `
)

// TODO: Check if this will be used in the future or can be removed
export const {
  materializedView: zkSyncEraBatchAvgDuration,
  createOrReplace: createOrReplaceZkSyncEraBatchAvgDuration,
} = createPgMaterializedView(
  'zk_sync_era_batch_avg_duration',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_finality: text('avg_finality').notNull(),
    avg_execution: text('avg_execution').notNull(),
  },
  sql`
    WITH
      averages AS (
        SELECT
          '7_days' AS period,
          MIN(batch_verified) AS start_date,
          MAX(batch_verified) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (batch_verified - batch_created)
            )
          ) AS avg_finality_seconds,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                batch_time_duration
            )
          ) AS avg_execution_seconds
        FROM
          zk_sync_era_batch_finality_mv
        WHERE
          batch_created >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(batch_verified) AS start_date,
          MAX(batch_verified) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (batch_verified - batch_created)
            )
          ) AS avg_finality_seconds,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                batch_time_duration
            )
          ) AS avg_execution_seconds
        FROM
          zk_sync_era_batch_finality_mv
        WHERE
          batch_created >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(batch_verified) AS start_date,
          MAX(batch_verified) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (batch_verified - batch_created)
            )
          ) AS avg_finality_seconds,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                batch_time_duration
            )
          ) AS avg_execution_seconds
        FROM
          zk_sync_era_batch_finality_mv
        WHERE
          batch_created >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '324'::INTEGER as chain_id,
      'zksync era' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      TO_CHAR(TO_TIMESTAMP(avg_finality_seconds), 'HH24:MI:SS') AS avg_finality,
      TO_CHAR(TO_TIMESTAMP(avg_execution_seconds), 'HH24:MI:SS') AS avg_execution
    FROM
      averages
    ORDER BY
      CASE
        WHEN period = '7_days' THEN 1
        WHEN period = '30_days' THEN 2
        WHEN period = '90_days' THEN 3
      END;
  `
)

// TODO: Check if this will be used in the future or can be removed
export const {
  materializedView: zkSyncEraNormalizationBatchedTxs,
  createOrReplace: createOrReplaceZkSyncEraNormalizationBatchedTxs,
} = createPgMaterializedView(
  'zk_sync_era_normalization_batched_txs',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_total_tx_num: numeric('avg_total_tx_num').notNull(),
    avg_total_eth_cost_by_100_with_state_diff: numeric(
      'avg_total_eth_cost_by_100_with_state_diff'
    ).notNull(),
    avg_total_usd_cost_by_100_with_state_diff: numeric(
      'avg_total_usd_cost_by_100_with_state_diff'
    ).notNull(),
    avg_duration_by_100: text('avg_duration_by_100').notNull(),
    avg_duration_by_100_state_diff: text(
      'avg_duration_by_100_state_diff'
    ).notNull(),
  },
  sql`
    WITH
      date_range AS (
        SELECT
          '7_days' AS period,
          MIN(zb.batch_verified) AS start_date,
          MAX(zb.batch_verified) AS end_date,
          AVG(txs.total_tx_count) AS avg_total_tx_num,
          AVG((txs.batch_total_cost_eth) / txs.total_tx_count) * 100 AS avg_total_eth_cost_by_100_with_state_diff,
          AVG(
            (txs.est_batch_total_cost_usd) / txs.total_tx_count
          ) * 100 AS avg_total_usd_cost_by_100_with_state_diff,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (zb.batch_verified - zb.batch_created)
            ) / txs.total_tx_count
          ) * 100 AS avg_duration_seconds,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (zb.executed_proven - zb.batch_created)
            ) / txs.total_tx_count
          ) * 100 AS avg_duration_seconds_with_state_diff
        FROM
          zk_sync_era_batch_finality_mv zb
          JOIN zk_sync_era_batch_cost_mv txs ON zb.batch_num = txs.batch_num
        WHERE
          zb.batch_verified IS NOT NULL
          AND zb.batch_created IS NOT NULL
          AND zb.batch_verified >= DATE_TRUNC('day', CURRENT_DATE) - INTERVAL '7 days'
          AND zb.batch_verified < DATE_TRUNC('day', CURRENT_DATE)
        GROUP BY
          period
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(zb.batch_verified) AS start_date,
          MAX(zb.batch_verified) AS end_date,
          AVG(txs.total_tx_count) AS avg_total_tx_num,
          AVG((txs.batch_total_cost_eth) / txs.total_tx_count) * 100 AS avg_total_eth_cost_by_100_with_state_diff,
          AVG(
            (txs.est_batch_total_cost_usd) / txs.total_tx_count
          ) * 100 AS avg_total_usd_cost_by_100_with_state_diff,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (zb.batch_verified - zb.batch_created)
            ) / txs.total_tx_count
          ) * 100 AS avg_duration_seconds,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (zb.executed_proven - zb.batch_created)
            ) / txs.total_tx_count
          ) * 100 AS avg_duration_seconds_with_state_diff
        FROM
          zk_sync_era_batch_finality_mv zb
          JOIN zk_sync_era_batch_cost_mv txs ON zb.batch_num = txs.batch_num
        WHERE
          zb.batch_verified IS NOT NULL
          AND zb.batch_created IS NOT NULL
          AND zb.batch_verified >= DATE_TRUNC('day', CURRENT_DATE) - INTERVAL '30 days'
          AND zb.batch_verified < DATE_TRUNC('day', CURRENT_DATE)
        GROUP BY
          period
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(zb.batch_verified) AS start_date,
          MAX(zb.batch_verified) AS end_date,
          AVG(txs.total_tx_count) AS avg_total_tx_num,
          AVG((txs.batch_total_cost_eth) / txs.total_tx_count) * 100 AS avg_total_eth_cost_by_100_with_state_diff,
          AVG(
            (txs.est_batch_total_cost_usd) / txs.total_tx_count
          ) * 100 AS avg_total_usd_cost_by_100_with_state_diff,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (zb.batch_verified - zb.batch_created)
            ) / txs.total_tx_count
          ) * 100 AS avg_duration_seconds,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (zb.executed_proven - zb.batch_created)
            ) / txs.total_tx_count
          ) * 100 AS avg_duration_seconds_with_state_diff
        FROM
          zk_sync_era_batch_finality_mv zb
          JOIN zk_sync_era_batch_cost_mv txs ON zb.batch_num = txs.batch_num
        WHERE
          zb.batch_verified IS NOT NULL
          AND zb.batch_created IS NOT NULL
          AND zb.batch_verified >= DATE_TRUNC('day', CURRENT_DATE) - INTERVAL '90 days'
          AND zb.batch_verified < DATE_TRUNC('day', CURRENT_DATE)
        GROUP BY
          period
      )
    SELECT
      '324'::INTEGER as chain_id,
      'zksync era' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      avg_total_tx_num,
      avg_total_eth_cost_by_100_with_state_diff,
      avg_total_usd_cost_by_100_with_state_diff,
      TO_CHAR(TO_TIMESTAMP(avg_duration_seconds), 'HH24:MI:SS') AS avg_duration_by_100,
      TO_CHAR(
        TO_TIMESTAMP(avg_duration_seconds_with_state_diff),
        'HH24:MI:SS'
      ) AS avg_duration_by_100_state_diff
    FROM
      date_range
    ORDER BY
      CASE
        WHEN period = '7_days' THEN 1
        WHEN period = '30_days' THEN 2
        ELSE 3
      END;
  `
)

export const {
  materializedView: zkSyncEraBatchDetailsMv,
  createOrReplace: createOrReplaceZkSyncEraBatchDetailsMv,
} = createPgMaterializedView(
  'zk_sync_batch_details_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    batch_num: bigint('	bigint', { mode: 'number' }).notNull(),
    batch_status: varchar('batch_status').notNull(),
    created_at: timestamp('created_at').notNull(),
    committed_at: timestamp('committed_at').notNull(),
    proven_at: timestamp('proven_at').notNull(),
    executed_at: timestamp('executed_at').notNull(),
    created_to_proven_duration: interval(
      'created_to_proven_duration'
    ).notNull(),
    created_to_executed_duration: interval(
      'created_to_executed_duration'
    ).notNull(),
    execute_size: bigint('	bigint', { mode: 'number' }).notNull(),
    batch_size: bigint('	bigint', { mode: 'number' }).notNull(),
    commit_cost_eth: numeric('commit_cost_eth').notNull(),
    prove_cost_eth: numeric('prove_cost_eth').notNull(),
    execute_cost_eth: numeric('execute_cost_eth').notNull(),
    divided_execute_cost_eth: numeric('divided_execute_cost_eth').notNull(),
    finality_cost_eth: numeric('finality_cost_eth').notNull(),
    commit_cost_usd: numeric('commit_cost_usd').notNull(),
    prove_cost_usd: numeric('prove_cost_usd').notNull(),
    execute_cost_usd: numeric('execute_cost_usd').notNull(),
    divided_execute_cost_usd: numeric('divided_execute_cost_usd').notNull(),
    finality_cost_usd: numeric('finality_cost_usd').notNull(),
    commit_tx_hash: varchar('commit_tx_hash').notNull(),
    prove_tx_hash: varchar('prove_tx_hash').notNull(),
    execute_tx_hash: varchar('execute_tx_hash').notNull(),
    batch_link: text('batch_link').notNull(),
  },
  sql`
    WITH
      batch_costs AS (
        SELECT
          batch_id,
          commit_tx_fee / 1e18 AS commit_tx_fee_eth,
          proven_tx_fee / 1e18 AS prove_tx_fee_eth,
          execute_tx_fee / 1e18 AS execute_tx_fee_eth
        FROM
          zk_sync_era_batch_receipts
      ),
      txs_count AS (
        SELECT
          "number" AS batch_num,
          SUM(l1_tx_count + l2_tx_count) AS batch_size
        FROM
          zk_sync_era_batches
        GROUP BY
          1
      )
    SELECT
      '324'::INTEGER AS chain_id,
      'zksync era' AS blockchain,
      zb."number" AS batch_num,
      CASE
        WHEN zb.status = 'verified' THEN 'finalized'
        ELSE zb.status
      END AS batch_status
      ----- timestamps
    ,
      DATE_TRUNC('second', zb."timestamp") AS created_at,
      DATE_TRUNC('second', zb.committed_at) AS committed_at,
      DATE_TRUNC('second', zb.proven_at) AS proven_at,
      DATE_TRUNC('second', zb.executed_at) AS executed_at,
      DATE_TRUNC('second', zb.proven_at) - DATE_TRUNC('second', zb."timestamp") AS created_to_proven_duration,
      DATE_TRUNC('second', zb.executed_at) - DATE_TRUNC('second', zb."timestamp") AS created_to_executed_duration,
      COUNT(*) OVER (
        PARTITION BY
          zb.execute_tx_hash
      ) AS execute_size,
      tc.batch_size
      ----- eth costs
    ,
      bc.commit_tx_fee_eth AS commit_cost_eth,
      bc.prove_tx_fee_eth AS prove_cost_eth,
      bc.execute_tx_fee_eth AS execute_cost_eth,
      bc.execute_tx_fee_eth / NULLIF(
        COUNT(*) OVER (
          PARTITION BY
            zb.execute_tx_hash
        ),
        0
      ) AS divided_execute_cost_eth,
      bc.prove_tx_fee_eth + bc.execute_tx_fee_eth / NULLIF(
        COUNT(*) OVER (
          PARTITION BY
            zb.execute_tx_hash
        ),
        0
      ) AS finality_cost_eth
      ----- usd costs
    ,
      ROUND((ep.price / 100.0) * bc.commit_tx_fee_eth, 2) AS commit_cost_usd,
      ROUND((ep.price / 100.0) * bc.prove_tx_fee_eth, 2) AS prove_cost_usd,
      ROUND((ep.price / 100.0) * bc.execute_tx_fee_eth, 2) AS execute_cost_usd,
      ROUND(
        (ep.price / 100.0) * bc.execute_tx_fee_eth / NULLIF(
          COUNT(*) OVER (
            PARTITION BY
              zb.execute_tx_hash
          ),
          0
        ),
        2
      ) AS divided_execute_cost_usd,
      ROUND(
        (ep.price / 100.0) * bc.prove_tx_fee_eth + (ep.price / 100.0) * bc.execute_tx_fee_eth / NULLIF(
          COUNT(*) OVER (
            PARTITION BY
              zb.execute_tx_hash
          ),
          0
        ),
        2
      ) AS finality_cost_usd
      ----- hashses
    ,
      zb.commit_tx_hash,
      zb.prove_tx_hash,
      zb.execute_tx_hash
      ----- link
    ,
      'https://explorer.zksync.io/batch/' || zb."number"::text AS batch_link
    FROM
      zk_sync_era_batches zb
      JOIN batch_costs bc ON zb.id = bc.batch_id
      JOIN eth_usd_price ep ON date_trunc('day', zb.executed_at) = date_trunc('day', ep."date")
      JOIN txs_count tc ON zb."number" = tc.batch_num
    WHERE
      zb.executed_at IS NOT NULL
      AND zb.executed_at < DATE_TRUNC('day', CURRENT_DATE)
    ORDER BY
      zb."number" DESC;
  `
)

export const {
  materializedView: zkSyncEraFinalityByPeriod,
  createOrReplace: createOrReplaceZkSyncEraFinalityByPeriod,
} = createPgMaterializedView(
  `zk_sync_era_finality_by_period`,
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_proven_time: text('avg_proven_time').notNull(),
    avg_execution_time: text('avg_execution_time').notNull(),
    avg_batch_size: numeric('avg_batch_size').notNull(),
    avg_commit_cost_eth: numeric('avg_commit_cost_eth').notNull(),
    avg_prove_cost_eth: numeric('avg_prove_cost_eth').notNull(),
    avg_execute_cost_eth: numeric('avg_execute_cost_eth').notNull(),
    avg_finality_cost_eth: numeric('avg_finality_cost_eth').notNull(),
    avg_commit_cost_usd: numeric('avg_commit_cost_usd').notNull(),
    avg_prove_cost_cost_usd: numeric('avg_prove_cost_cost_usd').notNull(),
    avg_execute_cost_usd: numeric('avg_execute_cost_usd').notNull(),
    avg_finality_cost_usd: numeric('avg_finality_cost_usd').notNull(),
  },
  sql`
    WITH
      averages AS (
        SELECT
          '1_day' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_proven_duration
            )
          ) AS avg_proven_time --- created_at-proven_at
    ,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_executed_duration
            )
          ) AS avg_execution_time --- created_at-executed_duration
    ,
          AVG(batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(prove_cost_eth) AS avg_prove_cost_eth,
          AVG(execute_cost_eth) AS avg_execute_cost_eth,
          AVG(finality_cost_eth) AS avg_finality_cost_eth --- prove_cost_eth+divided_execute_cost_eth
          ------- usd costs
    ,
          AVG(commit_cost_usd) AS avg_commit_cost_usd,
          AVG(prove_cost_usd) AS avg_prove_cost_cost_usd,
          AVG(execute_cost_usd) AS avg_execute_cost_usd,
          AVG(finality_cost_usd) AS avg_finality_cost_usd --- prove_cost_usd+divided_execute_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_proven_duration
            )
          ) AS avg_proven_time --- created_at-proven_at
    ,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_executed_duration
            )
          ) AS avg_execution_time --- created_at-executed_duration
    ,
          AVG(batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(prove_cost_eth) AS avg_prove_cost_eth,
          AVG(execute_cost_eth) AS avg_execute_cost_eth,
          AVG(finality_cost_eth) AS avg_finality_cost_eth --- prove_cost_eth+divided_execute_cost_eth
          ------- usd costs
    ,
          AVG(commit_cost_usd) AS avg_commit_cost_usd,
          AVG(prove_cost_usd) AS avg_prove_cost_cost_usd,
          AVG(execute_cost_usd) AS avg_execute_cost_usd,
          AVG(finality_cost_usd) AS avg_finality_cost_usd --- prove_cost_usd+divided_execute_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_proven_duration
            )
          ) AS avg_proven_time --- created_at-proven_at
    ,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_executed_duration
            )
          ) AS avg_execution_time --- created_at-executed_duration
    ,
          AVG(batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(prove_cost_eth) AS avg_prove_cost_eth,
          AVG(execute_cost_eth) AS avg_execute_cost_eth,
          AVG(finality_cost_eth) AS avg_finality_cost_eth --- prove_cost_eth+divided_execute_cost_eth
          ------- usd costs
    ,
          AVG(commit_cost_usd) AS avg_commit_cost_usd,
          AVG(prove_cost_usd) AS avg_prove_cost_cost_usd,
          AVG(execute_cost_usd) AS avg_execute_cost_usd,
          AVG(finality_cost_usd) AS avg_finality_cost_usd --- prove_cost_usd+divided_execute_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_proven_duration
            )
          ) AS avg_proven_time --- created_at-proven_at
    ,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_executed_duration
            )
          ) AS avg_execution_time --- created_at-executed_duration
    ,
          AVG(batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(prove_cost_eth) AS avg_prove_cost_eth,
          AVG(execute_cost_eth) AS avg_execute_cost_eth,
          AVG(finality_cost_eth) AS avg_finality_cost_eth --- prove_cost_eth+divided_execute_cost_eth
          ------- usd costs
    ,
          AVG(commit_cost_usd) AS avg_commit_cost_usd,
          AVG(prove_cost_usd) AS avg_prove_cost_cost_usd,
          AVG(execute_cost_usd) AS avg_execute_cost_usd,
          AVG(finality_cost_usd) AS avg_finality_cost_usd --- prove_cost_usd+divided_execute_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '324'::INTEGER as chain_id,
      'zksync era' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      TO_CHAR(TO_TIMESTAMP(avg_proven_time), 'HH24:MI:SS') AS avg_proven_time,
      TO_CHAR(TO_TIMESTAMP(avg_execution_time), 'HH24:MI:SS') AS avg_execution_time,
      ROUND(avg_batch_size) AS avg_batch_size,
      avg_commit_cost_eth,
      avg_prove_cost_eth,
      avg_execute_cost_eth,
      avg_finality_cost_eth,
      ROUND((avg_commit_cost_usd), 2) AS avg_commit_cost_usd,
      ROUND((avg_prove_cost_cost_usd), 2) AS avg_prove_cost_cost_usd,
      ROUND((avg_execute_cost_usd), 2) AS avg_execute_cost_usd,
      ROUND((avg_finality_cost_usd), 2) AS avg_finality_cost_usd
    FROM
      averages
    ORDER BY
      CASE
        WHEN period = '1_day' THEN 1
        WHEN period = '7_days' THEN 2
        WHEN period = '30_days' THEN 3
        WHEN period = '90_days' THEN 4
      END;
  `
)

export const {
  materializedView: zkSyncEraFinalityNormalizedBy100,
  createOrReplace: createOrReplaceZkSyncEraFinalityNormalizedBy100,
} = createPgMaterializedView(
  'zk_sync_era_finality_normalized_by_100',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_batch_size: numeric('avg_batch_size').notNull(),
    norm_batch_size_by_100_cost_eth: numeric(
      'norm_batch_size_by_100_cost_eth'
    ).notNull(),
    norm_batch_size_by_100_cost_usd: numeric(
      'norm_batch_size_by_100_cost_usd'
    ).notNull(),
    norm_batch_size_by_100_finality: interval(
      'norm_batch_size_by_100_finality'
    ).notNull(),
  },
  sql`
    WITH
      date_range AS (
        SELECT
          '1_day' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_proven_duration
            )
          ) AS avg_proven_time,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  created_to_proven_duration
              ) / batch_size
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(finality_cost_eth / batch_size) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(AVG(finality_cost_usd / batch_size) * 100, 2) AS norm_batch_size_by_100_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_proven_duration
            )
          ) AS avg_proven_time,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  created_to_proven_duration
              ) / batch_size
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(finality_cost_eth / batch_size) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(AVG(finality_cost_usd / batch_size) * 100, 2) AS norm_batch_size_by_100_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_proven_duration
            )
          ) AS avg_proven_time,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  created_to_proven_duration
              ) / batch_size
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(finality_cost_eth / batch_size) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(AVG(finality_cost_usd / batch_size) * 100, 2) AS norm_batch_size_by_100_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_proven_duration
            )
          ) AS avg_proven_time,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  created_to_proven_duration
              ) / batch_size
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(finality_cost_eth / batch_size) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(AVG(finality_cost_usd / batch_size) * 100, 2) AS norm_batch_size_by_100_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '324'::INTEGER as chain_id,
      'zksync era' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      ROUND(avg_batch_size) AS avg_batch_size,
      norm_batch_size_by_100_cost_eth,
      norm_batch_size_by_100_cost_usd,
      DATE_TRUNC('second', norm_batch_size_by_100_finality) AS norm_batch_size_by_100_finality
    FROM
      date_range
    ORDER BY
      CASE
        WHEN period = '1_day' THEN 1
        WHEN period = '7_days' THEN 2
        WHEN period = '30_days' THEN 3
        WHEN period = '90_days' THEN 4
      END;
  `
)

const zkSyncEraMaterializedViews = [
  zkSyncEraBatchCostMv,
  zkSyncEraBatchFinalityMv,
  zkSyncEraBatchCreatedMv,
  zkSyncEraBatchAvgCostMv,
  // zkSyncEraAvgCostOfBatchesDateRange,
  // zkSyncEraBatchAvgDuration,
  // zkSyncEraNormalizationBatchedTxs,
  zkSyncEraBatchDetailsMv,
  zkSyncEraFinalityByPeriod,
  zkSyncEraFinalityNormalizedBy100,
]

export async function refreshZkSyncEraMaterializedViews() {
  for (const view of zkSyncEraMaterializedViews) {
    await db.refreshMaterializedView(view)
  }
}

const zkSyncEraMaterializedViewsCreateOrReplaceFunctions = [
  createOrReplaceZkSyncEraBatchCostMv,
  createOrReplaceZkSyncEraBatchFinalityMv,
  createOrReplaceZkSyncEraBatchCreatedMv,
  createOrReplaceZkSyncEraBatchAvgCostMv,
  // createOrReplaceZkSyncEraAvgCostOfBatchesDateRange,
  // createOrReplaceZkSyncEraBatchAvgDuration,
  // createOrReplaceZkSyncEraNormalizationBatchedTxs,
  createOrReplaceZkSyncEraBatchDetailsMv,
  createOrReplaceZkSyncEraFinalityByPeriod,
  createOrReplaceZkSyncEraFinalityNormalizedBy100,
]

export async function creatOrReplaceZkSyncEraMaterializedViews() {
  for (const createOrReplaceView of zkSyncEraMaterializedViewsCreateOrReplaceFunctions) {
    await createOrReplaceView()
  }
}
