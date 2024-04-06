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
  materializedView: polygonZkEvmBatchDetails,
  createOrReplace: createOrReplacePolygonZkEvmBatchDetails,
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
  'polygon_zk_evm_finality_by_period_mv',
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
  'polygon_zk_evm_finality_normalized_by_100_mv',
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
    avg_finality_cost_eth: numeric('avg_finality_cost_eth').notNull(),
    avg_finality_cost_usd: numeric('avg_finality_cost_usd').notNull(),
    one_tx_cost_eth: numeric('one_tx_cost_eth').notNull(),
    one_tx_cost_usd: numeric('one_tx_cost_usd').notNull(),
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
          AVG(verification_cost_usd) AS avg_finality_cost_usd,
          AVG(verification_cost_eth) AS avg_finality_cost_eth,
          AVG(verification_batch_size) AS avg_batch_size,
          AVG(
            verification_cost_eth / NULLIF(verification_batch_size, 0)
          ) AS one_tx_cost_eth,
          AVG(
            verification_cost_usd / NULLIF(verification_batch_size, 0)
          ) AS one_tx_cost_usd,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time,
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
          AVG(
            verification_cost_usd / NULLIF(verification_batch_size, 0)
          ) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(verification_cost_usd) AS avg_finality_cost_usd,
          AVG(verification_cost_eth) AS avg_finality_cost_eth,
          AVG(verification_batch_size) AS avg_batch_size,
          AVG(
            verification_cost_eth / NULLIF(verification_batch_size, 0)
          ) AS one_tx_cost_eth,
          AVG(
            verification_cost_usd / NULLIF(verification_batch_size, 0)
          ) AS one_tx_cost_usd,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time,
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
          AVG(
            verification_cost_usd / NULLIF(verification_batch_size, 0)
          ) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(verification_cost_usd) AS avg_finality_cost_usd,
          AVG(verification_cost_eth) AS avg_finality_cost_eth,
          AVG(verification_batch_size) AS avg_batch_size,
          AVG(
            verification_cost_eth / NULLIF(verification_batch_size, 0)
          ) AS one_tx_cost_eth,
          AVG(
            verification_cost_usd / NULLIF(verification_batch_size, 0)
          ) AS one_tx_cost_usd,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time,
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
          AVG(
            verification_cost_usd / NULLIF(verification_batch_size, 0)
          ) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          fin_batch_details
        WHERE
          earliest_verified_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(earliest_verified_at) AS start_date,
          MAX(earliest_verified_at) AS end_date,
          AVG(verification_cost_usd) AS avg_finality_cost_usd,
          AVG(verification_cost_eth) AS avg_finality_cost_eth,
          AVG(verification_batch_size) AS avg_batch_size,
          AVG(
            verification_cost_eth / NULLIF(verification_batch_size, 0)
          ) AS one_tx_cost_eth,
          AVG(
            verification_cost_usd / NULLIF(verification_batch_size, 0)
          ) AS one_tx_cost_usd,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                avg_created_to_verified_duration
            )
          ) AS avg_verification_time,
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
          AVG(
            verification_cost_usd / NULLIF(verification_batch_size, 0)
          ) * 100 AS norm_batch_size_by_100_cost_usd
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
      avg_finality_cost_eth,
      avg_finality_cost_usd,
      one_tx_cost_eth,
      one_tx_cost_usd,
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

export const {
  materializedView: polygonZkEvmDailyFinalizedBatchStats,
  createOrReplace: createOrReplacePolygonZkEvmDailyFinalizedBatchStats,
} = createPgMaterializedView(
  'polygon_zk_evm_daily_finalized_batch_stats_mv',
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
  polygonZkEvmBatchDetails,
  polygonZkEvmFinalityByPeriod,
  polygonZkEvmFinalityNormalizedBy100,
  polygonZkEvmDailyFinalizedBatchStats,
]

export function refreshPolygonZkEvmMaterializedViews() {
  return refreshMaterializedViews(polygonZkEvmMaterializedViews)
}

const polygonZkEvmMaterializedViewsCreateOrReplaceFunctions = [
  createOrReplacePolygonZkEvmBatchDetails,
  createOrReplacePolygonZkEvmFinalityByPeriod,
  createOrReplacePolygonZkEvmFinalityNormalizedBy100,
  createOrReplacePolygonZkEvmDailyFinalizedBatchStats,
]

export function createOrReplacePolygonZkEvmMaterializedViews() {
  return creatOrReplaceMaterializedViews(
    polygonZkEvmMaterializedViewsCreateOrReplaceFunctions
  )
}
