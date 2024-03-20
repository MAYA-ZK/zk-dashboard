import { sql } from 'drizzle-orm'
import {
  bigint,
  integer,
  interval,
  numeric,
  pgEnum,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

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

const period = pgEnum('period', ['7_days', '30_days', '90_days'])

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
          zksync_batch_cost_mv
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
          zksync_batch_cost_mv
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
          zksync_batch_cost_mv
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
          zksync_batch_finality_mv
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
          zksync_batch_finality_mv
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
          zksync_batch_finality_mv
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
          zksync_batch_finality_mv zb
          JOIN zksync_batch_cost_mv txs ON zb.batch_num = txs.batch_num
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
          zksync_batch_finality_mv zb
          JOIN zksync_batch_cost_mv txs ON zb.batch_num = txs.batch_num
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
          zksync_batch_finality_mv zb
          JOIN zksync_batch_cost_mv txs ON zb.batch_num = txs.batch_num
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
