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

import { period } from './common'
import {
  creatOrReplaceMaterializedViews,
  createPgMaterializedView,
  refreshMaterializedViews,
} from './utils'

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
  materializedView: polygonZkEvmBatchDetailsMv,
  createOrReplace: createOrReplacePolygonZkEvmBatchDetailsMv,
} = createPgMaterializedView(
  'polygon_zk_evm_batch_details_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    batch_num: bigint('batch_num', { mode: 'number' }).notNull(),
    batch_status: text('batch_status').notNull(),
    created_at: timestamp('created_at').notNull(),
    sequenced_at: timestamp('sequenced_at').notNull(),
    verified_at: timestamp('verified_at').notNull(),
    created_to_verified_duration: interval(
      'created_to_verified_duration'
    ).notNull(),
    verification_size: bigint('verification_size', {
      mode: 'number',
    }).notNull(),
    verification_batch_size: bigint('verification_batch_size', {
      mode: 'number',
    }).notNull(),
    batch_size: integer('batch_size').notNull(),
    sequence_cost_eth: numeric('sequence_cost_eth').notNull(),
    verification_cost_eth: numeric('verification_cost_eth').notNull(),
    divided_verification_cost_eth: numeric(
      'divided_verification_cost_eth'
    ).notNull(),
    finality_cost_eth: numeric('finality_cost_eth').notNull(),
    sequence_cost_usd: numeric('sequence_cost_usd').notNull(),
    verification_cost_usd: numeric('verification_cost_usd').notNull(),
    divided_verification_cost_usd: numeric(
      'divided_verification_cost_usd'
    ).notNull(),
    finality_cost_usd: numeric('finality_cost_usd').notNull(),
    send_sequences_tx_hash: varchar('send_sequences_tx_hash').notNull(),
    verify_batch_tx_hash: varchar('verify_batch_tx_hash').notNull(),
    batch_link: text('batch_link').notNull(),
  },
  sql`
    WITH
      batch_costs AS (
        SELECT
          batch_id,
          send_sequences_tx_fee / 1e18 AS sequence_tx_fee_eth,
          verify_batch_tx_fee / 1e18 AS verification_tx_fee_eth
        FROM
          polygon_zk_evm_batch_receipts
      )
    SELECT
      '1101'::INTEGER AS chain_id,
      'polygon zkevm' AS blockchain,
      pb."number" AS batch_num,
      'finalized' AS batch_status
      ----- timestamps
    ,
      DATE_TRUNC('second', pb."timestamp") AS created_at,
      DATE_TRUNC('second', pb.sent_at) AS sequenced_at,
      DATE_TRUNC('second', pb.verified_at) AS verified_at,
      DATE_TRUNC('second', pb.verified_at) - DATE_TRUNC('second', pb."timestamp") AS created_to_verified_duration,
      COUNT(*) OVER (
        PARTITION BY
          pb.verify_batch_tx_hash
      ) AS verification_size,
      SUM(cardinality(pb.transactions)) OVER (
        PARTITION BY
          pb.verify_batch_tx_hash
      ) AS verification_batch_size,
      cardinality(pb.transactions) AS batch_size
      ----- eth costs
    ,
      bc.sequence_tx_fee_eth AS sequence_cost_eth,
      bc.verification_tx_fee_eth AS verification_cost_eth,
      bc.verification_tx_fee_eth / NULLIF(
        COUNT(*) OVER (
          PARTITION BY
            pb.verify_batch_tx_hash
        ),
        0
      ) AS divided_verification_cost_eth,
      (
        bc.sequence_tx_fee_eth + bc.verification_tx_fee_eth
      ) / NULLIF(
        COUNT(*) OVER (
          PARTITION BY
            pb.verify_batch_tx_hash
        ),
        0
      ) AS finality_cost_eth
      ----- usd costs
    ,
      ROUND((ep.price / 100.0) * bc.sequence_tx_fee_eth, 2) AS sequence_cost_usd,
      ROUND(
        (ep.price / 100.0) * bc.verification_tx_fee_eth,
        2
      ) AS verification_cost_usd,
      ROUND(
        (ep.price / 100.0) * bc.verification_tx_fee_eth / NULLIF(
          COUNT(*) OVER (
            PARTITION BY
              pb.verify_batch_tx_hash
          ),
          0
        ),
        2
      ) AS divided_verification_cost_usd,
      ROUND(
        (ep.price / 100.0) * (
          bc.sequence_tx_fee_eth + bc.verification_tx_fee_eth
        ) / NULLIF(
          COUNT(*) OVER (
            PARTITION BY
              pb.verify_batch_tx_hash
          ),
          0
        ),
        2
      ) AS finality_cost_usd
      ----- hashes
    ,
      pb.send_sequences_tx_hash,
      pb.verify_batch_tx_hash
      ----- link
    ,
      'https://zkevm.polygonscan.com/batch/' || pb."number"::text AS batch_link
    FROM
      polygon_zk_evm_batches pb
      JOIN batch_costs bc ON pb.id = bc.batch_id
      JOIN eth_usd_price ep ON DATE_TRUNC('day', pb.verified_at) = DATE_TRUNC('day', ep."date")
    WHERE
      pb.verified_at IS NOT NULL
      AND pb.verified_at < DATE_TRUNC('day', CURRENT_DATE)
    ORDER BY
      pb."number" DESC;
  `
)

export const {
  materializedView: polygonZkEvmFinalityByPeriod,
  createOrReplace: createOrReplacePolygonZkEvmFinalityByPeriod,
} = createPgMaterializedView(
  'polygon_zk_evm_finality_by_period',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_verification_time: text('avg_verification_time').notNull(),
    avg_batch_size: numeric('avg_batch_size').notNull(),
    avg_finality_cost_eth: numeric('avg_finality_cost_eth').notNull(),
    avg_finality_cost_usd: numeric('avg_finality_cost_usd').notNull(),
  },
  sql`
    WITH
      fin_batch_details AS (
        SELECT
          MIN(DATE_TRUNC('second', verified_at)) AS earliest_verified_at,
          verify_batch_tx_hash,
          verification_size,
          verification_batch_size,
          verification_cost_eth,
          verification_cost_usd,
          AVG(created_to_verified_duration) AS avg_created_to_verified_duration
        FROM
          polygon_zk_evm_batch_details_mv fin
        GROUP BY
          verify_batch_tx_hash,
          verification_size,
          verification_batch_size,
          verification_cost_eth,
          verification_cost_usd
        ORDER BY
          earliest_verified_at DESC
      ),
      averages AS (
        SELECT
          '1_day' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time,
          AVG(verification_batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(verification_cost_eth) AS avg_finality_cost_eth
          ------- usd costs
    ,
          AVG(verification_cost_usd) AS avg_finality_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time,
          AVG(verification_batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(verification_cost_eth) AS avg_finality_cost_eth
          ------- usd costs
    ,
          AVG(verification_cost_usd) AS avg_finality_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time,
          AVG(verification_batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(verification_cost_eth) AS avg_finality_cost_eth
          ------- usd costs
    ,
          AVG(verification_cost_usd) AS avg_finality_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time,
          AVG(verification_batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(verification_cost_eth) AS avg_finality_cost_eth
          ------- usd costs
    ,
          AVG(verification_cost_usd) AS avg_finality_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '1101'::INTEGER as chain_id,
      'polygon zkevm' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      TO_CHAR(TO_TIMESTAMP(avg_verification_time), 'HH24:MI:SS') AS avg_verification_time,
      ROUND(avg_batch_size) AS avg_batch_size,
      avg_finality_cost_eth,
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
  materializedView: polygonZkEvmFinalityNormalizedBy100,
  createOrReplace: createOrReplacePolygonZkEvmFinalityNormalizedBy100,
} = createPgMaterializedView(
  'polygon_zk_evm_finality_normalized_by_100',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_batch_size: numeric('avg_batch_size').notNull(),
    norm_batch_size_by_100_finality: interval(
      'norm_batch_size_by_100_finality'
    ).notNull(),
    norm_batch_size_by_100_cost_eth: numeric(
      'norm_batch_size_by_100_cost_eth'
    ).notNull(),
    norm_batch_size_by_100_cost_usd: numeric(
      'norm_batch_size_by_100_cost_usd'
    ).notNull(),
  },
  sql`
    WITH
      fin_batch_details AS (
        SELECT
          MIN(DATE_TRUNC('second', verified_at)) AS earliest_verified_at,
          verify_batch_tx_hash,
          verification_size,
          verification_batch_size,
          verification_cost_eth,
          verification_cost_usd,
          AVG(created_to_verified_duration) AS avg_created_to_verified_duration
        FROM
          polygon_zk_evm_batch_details_mv fin
        GROUP BY
          verify_batch_tx_hash,
          verification_size,
          verification_batch_size,
          verification_cost_eth,
          verification_cost_usd
        ORDER BY
          earliest_verified_at DESC
      ),
      date_range AS (
        SELECT
          '1_day' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(verification_batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time -- created_at-verified_at
    ,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  avg_created_to_verified_duration
              ) / NULLIF(verification_batch_size, 0)
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(
            verification_cost_eth / NULLIF(verification_batch_size, 0)
          ) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(
            AVG(
              verification_cost_usd / NULLIF(verification_batch_size, 0)
            ) * 100,
            2
          ) AS norm_batch_size_by_100_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(verification_batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time -- created_at-verified_at
    ,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  avg_created_to_verified_duration
              ) / NULLIF(verification_batch_size, 0)
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(
            verification_cost_eth / NULLIF(verification_batch_size, 0)
          ) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(
            AVG(
              verification_cost_usd / NULLIF(verification_batch_size, 0)
            ) * 100,
            2
          ) AS norm_batch_size_by_100_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(verification_batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time -- created_at-verified_at
    ,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  avg_created_to_verified_duration
              ) / NULLIF(verification_batch_size, 0)
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(
            verification_cost_eth / NULLIF(verification_batch_size, 0)
          ) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(
            AVG(
              verification_cost_usd / NULLIF(verification_batch_size, 0)
            ) * 100,
            2
          ) AS norm_batch_size_by_100_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(verification_batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time -- created_at-verified_at
    ,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  avg_created_to_verified_duration
              ) / NULLIF(verification_batch_size, 0)
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(
            verification_cost_eth / NULLIF(verification_batch_size, 0)
          ) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(
            AVG(
              verification_cost_usd / NULLIF(verification_batch_size, 0)
            ) * 100,
            2
          ) AS norm_batch_size_by_100_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '1101'::INTEGER as chain_id,
      'polygon zkevm' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      ROUND(avg_batch_size) AS avg_batch_size,
      DATE_TRUNC('second', norm_batch_size_by_100_finality) AS norm_batch_size_by_100_finality,
      norm_batch_size_by_100_cost_eth,
      norm_batch_size_by_100_cost_usd
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

export const {
  materializedView: polygonZkEvmDailyFinalizedBatchStats,
  createOrReplace: createOrReplacePolygonZkEvmDailyFinalizedBatchStats,
} = createPgMaterializedView(
  'polygon_zk_evm_daily_finalized_batch_stats',
  {
    fin_date: text('fin_date').notNull(),
    total_daily_finalized_batch_count: bigint(
      'total_daily_finalized_batch_count',
      { mode: 'number' }
    ).notNull(),
    total_daily_finalized_transactions: bigint(
      'total_daily_finalized_transactions',
      { mode: 'number' }
    ).notNull(),
    total_daily_commit_cost_eth: numeric(
      'total_daily_commit_cost_eth'
    ).notNull(),
    total_daily_finalized_cost_eth: numeric(
      'total_daily_finalized_cost_eth'
    ).notNull(),
    total_daily_finality_cost_eth: numeric(
      'total_daily_finality_cost_eth'
    ).notNull(),
    total_daily_commit_cost_usd: numeric(
      'total_daily_commit_cost_usd'
    ).notNull(),
    total_daily_finalized_cost_usd: numeric(
      'total_daily_finalized_cost_usd'
    ).notNull(),
    total_daily_finality_cost_usd: numeric(
      'total_daily_finality_cost_usd'
    ).notNull(),
  },
  sql`
    SELECT
      TO_CHAR(DATE_TRUNC('day', verified_at), 'YYYY-MM-DD') AS fin_date -- The date of finalization on L1
    ,
      COUNT(batch_num) AS total_daily_finalized_batch_count -- Total number of batches finalized on L1 each day
    ,
      SUM(batch_size) AS total_daily_finalized_transactions -- Total number of L2 transactions finalized on L1 each day
      ----- eth costs
    ,
      SUM(sequence_cost_eth) AS total_daily_sequence_cost_eth,
      SUM(verification_cost_eth) AS total_daily_verification_cost_eth,
      SUM(finality_cost_eth) AS total_daily_finality_cost_eth
      ----- usd costs
    ,
      SUM(sequence_cost_usd) AS total_daily_sequence_cost_usd,
      SUM(verification_cost_usd) AS total_daily_verification_cost_usd,
      SUM(finality_cost_usd) AS total_daily_finality_cost_usd
    FROM
      polygon_zk_evm_batch_details_mv
    WHERE
      verified_at < DATE_TRUNC('day', CURRENT_DATE)
    GROUP BY
      DATE_TRUNC('day', verified_at)
    ORDER BY
      fin_date DESC;
  `
)

const polygonZkEvmMaterializedViews = [
  polygonZkEvmBatchCostMv,
  polygonZkEvmBatchFinalityMv,
  polygonZkEvmBatchDetailsMv,
  polygonZkEvmFinalityByPeriod,
  polygonZkEvmFinalityNormalizedBy100,
  polygonZkEvmDailyFinalizedBatchStats,
]

export function refreshPolygonZkEvmMaterializedViews() {
  return refreshMaterializedViews(polygonZkEvmMaterializedViews)
}

const polygonZkEvmMaterializedViewsCreateOrReplaceFunctions = [
  createOrReplacePolygonZkEvmBatchCostMv,
  createOrReplacePolygonZkEvmBatchFinalityMv,
  createOrReplacePolygonZkEvmBatchDetailsMv,
  createOrReplacePolygonZkEvmFinalityByPeriod,
  createOrReplacePolygonZkEvmFinalityNormalizedBy100,
  createOrReplacePolygonZkEvmDailyFinalizedBatchStats,
]

export function createOrReplacePolygonZkEvmMaterializedViews() {
  return creatOrReplaceMaterializedViews(
    polygonZkEvmMaterializedViewsCreateOrReplaceFunctions
  )
}
