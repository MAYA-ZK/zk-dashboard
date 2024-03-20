import { sql } from 'drizzle-orm'
import {
  bigint,
  integer,
  interval,
  numeric,
  pgEnum,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { createPgMaterializedView } from './utils'

export const {
  materializedView: polygonZkEvmBatchCostMv,
  createOrReplace: createOrReplacePolygonZkEvmBatchCostMv,
} = createPgMaterializedView(
  'polygon_zk_evm_batch_cost_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    batch_num: bigint('batch_num', { mode: 'number' }).notNull(),
    batch_status: text('batch_status').notNull(),
    batch_verification: timestamp('batch_verification').notNull(),
    total_tx_count: integer('total_tx_count').notNull(),
    commit_tx_fee_eth: numeric('commit_tx_fee_eth').notNull(),
    verification_tx_fee_eth: numeric('verification_tx_fee_eth').notNull(),
    total_tx_fee_eth: numeric('total_tx_fee_eth').notNull(),
    total_tx_fee_per_unit_eth: numeric('total_tx_fee_per_unit_eth').notNull(),
    max_cost_eth: numeric('max_cost_eth').notNull(),
    avg_cost_eth: numeric('avg_cost_eth').notNull(),
    min_cost_eth: numeric('min_cost_eth').notNull(),
    cumulative_cost_eth: numeric('cumulative_cost_eth').notNull(),
    est_commit_cost_usd: numeric('est_commit_cost_usd').notNull(),
    est_verification_cost_usd: numeric('est_verification_cost_usd').notNull(),
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
      batch_costs as (
        SELECT
          batch_id,
          send_sequences_tx_fee / 1e18 as commit_tx_fee_eth,
          verify_batch_tx_fee / 1e18 as verification_tx_fee_eth,
          total_tx_fee / 1e18 as total_tx_fee_eth,
          total_tx_fee_per_unit / 1e18 as total_tx_fee_per_unit_eth
        FROM
          polygon_zk_evm_batch_receipts
      ),
      aggregates as (
        SELECT
          MAX(total_tx_fee) / 1e18 as max_cost_eth,
          AVG(total_tx_fee) / 1e18 as avg_cost_eth,
          MIN(total_tx_fee) / 1e18 as min_cost_eth
        FROM
          polygon_zk_evm_batch_receipts
      ),
      daily_avg_cost AS (
        SELECT
          date_trunc('day', pb.verified_at) AS day,
          AVG(bc.total_tx_fee_eth * (ep.price / 100.0)) AS avg_daily_cost_usd
        FROM
          polygon_zk_evm_batches pb
          JOIN batch_costs bc ON pb.id = bc.batch_id
          JOIN eth_usd_price ep ON date_trunc('day', pb.verified_at) = date_trunc('day', ep."date")
        GROUP BY
          day
      )
    SELECT
      '1101'::INTEGER as chain_id,
      'polygon zkevm' as blockchain,
      pb."number" as batch_num,
      'finalized' as batch_status,
      pb.verified_at as batch_verification,
      cardinality(pb.transactions) as total_tx_count,
      bc.commit_tx_fee_eth,
      bc.verification_tx_fee_eth,
      bc.total_tx_fee_eth,
      bc.total_tx_fee_per_unit_eth,
      ag.max_cost_eth,
      ag.avg_cost_eth,
      ag.min_cost_eth,
      SUM(bc.total_tx_fee_eth) OVER (
        ORDER BY
          pb.verified_at
      ) as cumulative_cost_eth,
      ROUND((ep.price / 100.0) * bc.commit_tx_fee_eth, 2) as est_commit_cost_usd,
      ROUND(
        (ep.price / 100.0) * bc.verification_tx_fee_eth,
        2
      ) as est_verification_cost_usd,
      ROUND((ep.price / 100.0) * bc.total_tx_fee_eth, 2) as est_batch_total_cost_usd,
      ROUND(dac.avg_daily_cost_usd, 2) as avg_est_batch_total_cost_daily_usd,
      ROUND(
        (ep.price / 100.0) * bc.total_tx_fee_per_unit_eth,
        2
      ) as est_batch_txs_recorded_divided_usd,
      ROUND(
        (ep.price / 100.0) * SUM(bc.total_tx_fee_eth) OVER (
          ORDER BY
            pb.verified_at
        ),
        2
      ) as est_batch_cumulative_cost_usd,
      'https://zkevm.polygonscan.com/batch/' || pb."number"::text as batch_link
    FROM
      polygon_zk_evm_batches pb
      JOIN batch_costs bc ON pb.id = bc.batch_id
      JOIN eth_usd_price ep ON date_trunc('day', pb.verified_at) = date_trunc('day', ep."date")
      JOIN daily_avg_cost dac ON date_trunc('day', pb.verified_at) = dac.day,
      LATERAL (
        SELECT
          *
        FROM
          aggregates
      ) ag
    WHERE
      pb.verified_at is not NULL
      AND pb.verified_at < date_trunc('day', CURRENT_DATE)
    ORDER BY
      pb."number" DESC;
  `
)

export const {
  materializedView: polygonZkEvmBatchFinalityMv,
  createOrReplace: createOrReplacePolygonZkEvmBatchFinalityMv,
} = createPgMaterializedView(
  'polygon_zk_evm_batch_finality_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    batch_num: bigint('batch_num', { mode: 'number' }).notNull(),
    batch_status: text('batch_status').notNull(),
    batch_created: timestamp('batch_created').notNull(),
    batch_committed: timestamp('batch_committed').notNull(),
    batch_verified: timestamp('batch_verified').notNull(),
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
          DATE_TRUNC('day', "timestamp") AS batch_day,
          verified_at - "timestamp" AS duration
        FROM
          polygon_zk_evm_batches
        WHERE
          verified_at IS NOT NULL
          AND "timestamp" IS NOT NULL
          AND verified_at < DATE_TRUNC('day', CURRENT_DATE)
        ORDER BY
          "timestamp" ASC
      ),
      aggregates AS (
        SELECT
          batch_day,
          MAX(duration) AS daily_max_duration,
          AVG(duration) AS daily_avg_duration,
          MIN(duration) AS daily_min_duration
        FROM
          batch_finality
        GROUP BY
          batch_day
      )
    SELECT
      '1101'::INTEGER AS chain_id,
      'polygon zkevm' AS blockchain,
      pb."number" AS batch_num,
      'finalized' AS batch_status,
      pb."timestamp" AS batch_created,
      pb.sent_at AS batch_committed,
      pb.verified_at AS batch_verified,
      pb.verified_at - pb."timestamp" AS batch_time_duration,
      agg.daily_max_duration,
      agg.daily_avg_duration,
      agg.daily_min_duration,
      'https://zkevm.polygonscan.com/batch/' || pb."number"::text AS batch_link
    FROM
      polygon_zk_evm_batches pb
      JOIN aggregates agg ON DATE_TRUNC('day', pb."timestamp") = agg.batch_day
    WHERE
      pb.verified_at IS NOT NULL
      AND pb."timestamp" IS NOT NULL
      AND pb.verified_at < DATE_TRUNC('day', CURRENT_DATE)
    ORDER BY
      pb."number" DESC;
  `
)

export const {
  materializedView: polygonZkEvmBatchCreatedMv,
  createOrReplace: createOrReplacePolygonZkEvmBatchCreatedMv,
} = createPgMaterializedView(
  'polygon_zk_evm_batch_created_mv',
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
          date_trunc('day', "timestamp") as tx_date,
          count("number") as batch_count,
          count(
            DISTINCT CASE
              WHEN send_sequences_tx_hash IS NOT NULL THEN "number"
            END
          ) as batch_count_committed,
          count(
            DISTINCT CASE
              WHEN "timestamp" IS NOT NULL THEN "number"
            END
          ) as batch_count_verified
        FROM
          polygon_zk_evm_batches
        WHERE
          "timestamp" < date_trunc('day', CURRENT_DATE)
        GROUP BY
          1
      ),
      batched_blocks as (
        SELECT
          date_trunc('day', "timestamp") as tx_date,
          count(*) as block_count,
          sum(cardinality(transactions)) as txs_total
        FROM
          polygon_zk_evm_batches
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
      '1101'::INTEGER as chain_id,
      'polygon zkevm' as blockchain,
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
  materializedView: polygonZkEvmBatchAvgCostMv,
  createOrReplace: createOrReplacePolygonZkEvmBatchAvgCostMv,
} = createPgMaterializedView(
  'polygon_zk_evm_batch_avg_cost_mv',
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
      polygon_zk_evm_batch_cost_mv
    GROUP BY
      DATE_TRUNC('day', batch_verification)
    ORDER BY
      tx_date DESC;
  `
)

const period = pgEnum('period', ['7_days', '30_days', '90_days'])

export const {
  materializedView: polygonZkEvmAvgCostOfBatchesDateRange,
  createOrReplace: createOrReplacePolygonZkEvmAvgCostOfBatchesDateRange,
} = createPgMaterializedView(
  'polygon_zk_evm_avg_cost_of_batches_date_range',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_txs_inside_a_batch: numeric('avg_txs_inside_a_batch').notNull(),
    avg_commit_cost_eth: numeric('avg_commit_cost_eth').notNull(),
    avg_verification_cost_eth: numeric('avg_verification_cost_eth').notNull(),
    avg_total_cost_eth: numeric('avg_total_cost_eth').notNull(),
    avg_commit_cost_usd: numeric('avg_commit_cost_usd').notNull(),
    avg_verification_cost_usd: numeric('avg_verification_cost_usd').notNull(),
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
          AVG(commit_tx_fee_eth) AS avg_commit_cost_eth,
          AVG(verification_tx_fee_eth) AS avg_verification_cost_eth,
          AVG(total_tx_fee_eth) AS avg_total_cost_eth,
          AVG(est_commit_cost_usd) AS avg_commit_cost_usd,
          AVG(est_verification_cost_usd) AS avg_verification_cost_usd,
          AVG(est_batch_total_cost_usd) AS avg_total_cost_usd
        FROM
          polygon_zk_evm_batch_cost_mv
        WHERE
          batch_verification >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(batch_verification) AS start_date,
          MAX(batch_verification) AS end_date,
          AVG(total_tx_count) AS avg_txs_inside_a_batch,
          AVG(commit_tx_fee_eth) AS avg_commit_cost_eth,
          AVG(verification_tx_fee_eth) AS avg_verification_cost_eth,
          AVG(total_tx_fee_eth) AS avg_total_cost_eth,
          AVG(est_commit_cost_usd) AS avg_commit_cost_usd,
          AVG(est_verification_cost_usd) AS avg_verification_cost_usd,
          AVG(est_batch_total_cost_usd) AS avg_total_cost_usd
        FROM
          polygon_zk_evm_batch_cost_mv
        WHERE
          batch_verification >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(batch_verification) AS start_date,
          MAX(batch_verification) AS end_date,
          AVG(total_tx_count) AS avg_txs_inside_a_batch,
          AVG(commit_tx_fee_eth) AS avg_commit_cost_eth,
          AVG(verification_tx_fee_eth) AS avg_verification_cost_eth,
          AVG(total_tx_fee_eth) AS avg_total_cost_eth,
          AVG(est_commit_cost_usd) AS avg_commit_cost_usd,
          AVG(est_verification_cost_usd) AS avg_verification_cost_usd,
          AVG(est_batch_total_cost_usd) AS avg_total_cost_usd
        FROM
          polygon_zk_evm_batch_cost_mv
        WHERE
          batch_verification >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '1101'::INTEGER as chain_id,
      'polygon zkevm' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      avg_txs_inside_a_batch,
      avg_commit_cost_eth,
      avg_verification_cost_eth,
      avg_total_cost_eth,
      avg_commit_cost_usd,
      avg_verification_cost_usd,
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
  materializedView: polygonZkEvmBatchAvgDuration,
  createOrReplace: createOrReplacePolygonZkEvmBatchAvgDuration,
} = createPgMaterializedView(
  'polygon_zk_evm_batch_avg_duration',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_finality: text('avg_finality').notNull(),
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
                batch_time_duration
            )
          ) AS avg_finality_seconds
        FROM
          polygon_zk_evm_batch_finality_mv
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
                batch_time_duration
            )
          ) AS avg_finality_seconds
        FROM
          polygon_zk_evm_batch_finality_mv
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
                batch_time_duration
            )
          ) AS avg_finality_seconds
        FROM
          polygon_zk_evm_batch_finality_mv
        WHERE
          batch_created >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '1101'::INTEGER as chain_id,
      'polygon zkevm' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      TO_CHAR(TO_TIMESTAMP(avg_finality_seconds), 'HH24:MI:SS') AS avg_finality
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
  materializedView: polygonZkEvmNormalizationBatchedTxs,
  createOrReplace: createOrReplacePolygonZkEvmNormalizationBatchedTxs,
} = createPgMaterializedView(
  'polygon_zk_evm_normalization_batched_txs',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_total_tx_num: numeric('avg_total_tx_num').notNull(),
    avg_total_eth_cost_by_100: numeric('avg_total_eth_cost_by_100').notNull(),
    avg_total_usd_cost_by_100: numeric('avg_total_usd_cost_by_100').notNull(),
    avg_duration_by_100: text('avg_duration_by_100').notNull(),
  },
  // IF NULL has been applied here since we have batches with zero transactions, examples being batch number 1719174 and 1984750
  sql`
    WITH
      date_range AS (
        SELECT
          '7_days' AS period,
          MIN(pb.batch_verified) AS start_date,
          MAX(pb.batch_verified) AS end_date,
          AVG(txs.total_tx_count) AS avg_total_tx_num,
          AVG(
            (txs.total_tx_fee_eth) / NULLIF(txs.total_tx_count, 0)
          ) * 100 AS avg_total_eth_cost_by_100,
          AVG(
            (txs.est_batch_total_cost_usd) / NULLIF(txs.total_tx_count, 0)
          ) * 100 AS avg_total_usd_cost_by_100,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (pb.batch_verified - pb.batch_created)
            ) / NULLIF(txs.total_tx_count, 0)
          ) * 100 AS avg_duration_seconds
        FROM
          polygon_zk_evm_batch_finality_mv pb
          JOIN polygon_zk_evm_batch_cost_mv txs ON pb.batch_num = txs.batch_num
        WHERE
          pb.batch_verified IS NOT NULL
          AND pb.batch_created IS NOT NULL
          AND pb.batch_verified >= DATE_TRUNC('day', CURRENT_DATE) - INTERVAL '7 days'
          AND pb.batch_verified < DATE_TRUNC('day', CURRENT_DATE)
        GROUP BY
          period
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(pb.batch_verified) AS start_date,
          MAX(pb.batch_verified) AS end_date,
          AVG(txs.total_tx_count) AS avg_total_tx_num,
          AVG(
            (txs.total_tx_fee_eth) / NULLIF(txs.total_tx_count, 0)
          ) * 100 AS avg_total_eth_cost_by_100,
          AVG(
            (txs.est_batch_total_cost_usd) / NULLIF(txs.total_tx_count, 0)
          ) * 100 AS avg_total_usd_cost_by_100,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (pb.batch_verified - pb.batch_created)
            ) / NULLIF(txs.total_tx_count, 0)
          ) * 100 AS avg_duration_seconds
        FROM
          polygon_zk_evm_batch_finality_mv pb
          JOIN polygon_zk_evm_batch_cost_mv txs ON pb.batch_num = txs.batch_num
        WHERE
          pb.batch_verified IS NOT NULL
          AND pb.batch_created IS NOT NULL
          AND pb.batch_verified >= DATE_TRUNC('day', CURRENT_DATE) - INTERVAL '30 days'
          AND pb.batch_verified < DATE_TRUNC('day', CURRENT_DATE)
        GROUP BY
          period
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(pb.batch_verified) AS start_date,
          MAX(pb.batch_verified) AS end_date,
          AVG(txs.total_tx_count) AS avg_total_tx_num,
          AVG(
            (txs.total_tx_fee_eth) / NULLIF(txs.total_tx_count, 0)
          ) * 100 AS avg_total_eth_cost_by_100,
          AVG(
            (txs.est_batch_total_cost_usd) / NULLIF(txs.total_tx_count, 0)
          ) * 100 AS avg_total_usd_cost_by_100,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                (pb.batch_verified - pb.batch_created)
            ) / NULLIF(txs.total_tx_count, 0)
          ) * 100 AS avg_duration_seconds
        FROM
          polygon_zk_evm_batch_finality_mv pb
          JOIN polygon_zk_evm_batch_cost_mv txs ON pb.batch_num = txs.batch_num
        WHERE
          pb.batch_verified IS NOT NULL
          AND pb.batch_created IS NOT NULL
          AND pb.batch_verified >= DATE_TRUNC('day', CURRENT_DATE) - INTERVAL '90 days'
          AND pb.batch_verified < DATE_TRUNC('day', CURRENT_DATE)
        GROUP BY
          period
      )
    SELECT
      '1101'::INTEGER as chain_id,
      'polygon zkevm' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      avg_total_tx_num,
      avg_total_eth_cost_by_100,
      avg_total_usd_cost_by_100,
      TO_CHAR(TO_TIMESTAMP(avg_duration_seconds), 'HH24:MI:SS') AS avg_duration_by_100
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
