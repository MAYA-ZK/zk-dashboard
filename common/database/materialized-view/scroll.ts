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
  materializedView: scrollBatchCostMV,
  createOrReplace: createOrReplaceScrollBatchCostMV,
} = createPgMaterializedView(
  'scroll_batch_cost_mv',
  {
    average_total_cost_eth: numeric('average_total_cost_eth').notNull(),
    avg_est_batch_total_cost_daily_usd: numeric(
      'avg_est_batch_total_cost_daily_usd'
    ).notNull(),
    batch_link: text('batch_link').notNull(),
    batch_num: integer('batch_num').notNull(),
    batch_status: text('batch_status', { enum: ['finalized'] }).notNull(),
    batch_total_cost_eth: numeric('batch_total_cost_eth').notNull(),
    batch_txs_recorded_divided_eth: numeric(
      'batch_txs_recorded_divided_eth'
    ).notNull(),
    batch_verification: timestamp('batch_verification').notNull(),
    blockchain: text('blockchain').notNull(),
    chain_id: integer('chain_id').notNull(),
    commit_cost_eth: numeric('commit_cost_eth').notNull(),
    cumulative_cost_eth: numeric('cumulative_cost_eth').notNull(),
    est_batch_cumulative_cost_usd: numeric(
      'est_batch_cumulative_cost_usd'
    ).notNull(),
    est_batch_total_cost_usd: numeric('est_batch_total_cost_usd').notNull(),
    est_batch_txs_recorded_divided_usd: numeric(
      'est_batch_txs_recorded_divided_usd'
    ).notNull(),
    est_commit_cost_usd: numeric('est_commit_cost_usd').notNull(),
    est_verification_cost_usd: numeric('est_verification_cost_usd').notNull(),
    highest_total_cost_eth: numeric('highest_total_cost_eth').notNull(),
    lowest_total_cost_eth: numeric('lowest_total_cost_eth').notNull(),
    total_tx_count: integer('total_tx_count').notNull(),
    verification_cost_eth: numeric('verification_cost_eth').notNull(),
  },
  sql`
    WITH
      batch_costs as (
        SELECT
          batch_id,
          commit_tx_effective_price / 1e18 as commit_tx_fee_eth,
          finalize_tx_effective_price / 1e18 as verification_tx_fee_eth,
          total_tx_effective_price / 1e18 as total_tx_fee_eth,
          total_tx_effective_unit_price / 1e18 as total_tx_fee_per_unit_eth
        FROM
          scroll_batch_receipts
      ),
      aggregates as (
        SELECT
          MAX(total_tx_effective_price) / 1e18 as max_cost_eth,
          AVG(total_tx_effective_price) / 1e18 as avg_cost_eth,
          MIN(total_tx_effective_price) / 1e18 as min_cost_eth
        FROM
          scroll_batch_receipts
      ),
      daily_avg_cost as (
        SELECT
          date_trunc('day', sb.finalized_at) as day,
          AVG(bc.total_tx_fee_eth * (ep.price / 100.0)) as avg_daily_cost_usd
        FROM
          scroll_batches sb
          JOIN batch_costs bc ON sb.id = bc.batch_id
          JOIN eth_usd_price ep ON date_trunc('day', sb.finalized_at) = date_trunc('day', ep."date")
        GROUP BY
          day
      )
    SELECT
      '534352'::INTEGER as chain_id,
      'scroll' as blockchain,
      sb."number" as batch_num,
      sb.rollup_status as batch_status,
      sb.finalized_at as batch_verification,
      sb.total_tx_num as total_tx_count,
      bc.commit_tx_fee_eth as commit_cost_eth,
      bc.verification_tx_fee_eth as verification_cost_eth,
      bc.total_tx_fee_eth as batch_total_cost_eth,
      bc.total_tx_fee_per_unit_eth as batch_txs_recorded_divided_eth,
      ag.max_cost_eth as highest_total_cost_eth,
      ag.avg_cost_eth as average_total_cost_eth,
      ag.min_cost_eth as lowest_total_cost_eth,
      SUM(bc.total_tx_fee_eth) OVER (
        ORDER BY
          sb.finalized_at
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
            sb.finalized_at
        ),
        2
      ) as est_batch_cumulative_cost_usd,
      'https://scroll.io/rollupscan/batch/' || sb."number"::TEXT as batch_link
    FROM
      scroll_batches sb
      JOIN batch_costs bc ON sb.id = bc.batch_id
      JOIN eth_usd_price ep ON date_trunc('day', sb.finalized_at) = date_trunc('day', ep."date")
      JOIN daily_avg_cost dac ON date_trunc('day', sb.finalized_at) = dac.day,
      LATERAL (
        SELECT
          *
        FROM
          aggregates
      ) ag
    WHERE
      sb.finalized_at IS NOT NULL
      AND finalized_at < date_trunc('day', CURRENT_DATE)
    ORDER BY
      batch_num DESC;
  `
)

export const {
  materializedView: scrollBatchFinalityMv,
  createOrReplace: createOrReplaceScrollBatchFinalityMv,
} = createPgMaterializedView(
  'scroll_batch_finality_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    batch_num: integer('batch_num').notNull(),
    batch_status: varchar('batch_status').notNull(),
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
          finalized_at - "timestamp" AS duration
        FROM
          scroll_batches
        WHERE
          finalized_at IS NOT NULL
          AND "timestamp" IS NOT NULL
          AND finalized_at < DATE_TRUNC('day', CURRENT_DATE)
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
      '534352'::INTEGER AS chain_id,
      'scroll' AS blockchain,
      sb."number" AS batch_num,
      sb.rollup_status AS batch_status,
      sb."timestamp" AS batch_created,
      sb.committed_at AS batch_committed,
      sb.finalized_at AS batch_verified,
      sb.finalized_at - sb."timestamp" AS batch_time_duration,
      agg.daily_max_duration,
      agg.daily_avg_duration,
      agg.daily_min_duration,
      'https://scroll.io/rollupscan/batch/' || sb."number"::TEXT AS batch_link
    FROM
      scroll_batches sb
      JOIN aggregates agg ON DATE_TRUNC('day', sb."timestamp") = agg.batch_day
    WHERE
      sb.finalized_at IS NOT NULL
      AND sb."timestamp" IS NOT NULL
      AND sb.finalized_at < DATE_TRUNC('day', CURRENT_DATE)
    ORDER BY
      sb."number" DESC;
  `
)

export const {
  materializedView: scrollBatchDetails,
  createOrReplace: createOrReplaceScrollBatchDetails,
} = createPgMaterializedView(
  'scroll_batch_details',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    batch_num: integer('batch_num').notNull(),
    batch_status: varchar('batch_status').notNull(),
    created_at: timestamp('created_at').notNull(),
    committed_at: timestamp('committed_at').notNull(),
    finalized_at: timestamp('finalized_at').notNull(),
    created_to_finalized_duration: interval(
      'created_to_finalized_duration'
    ).notNull(),
    batch_size: integer('batch_size').notNull(),
    commit_cost_eth: numeric('commit_cost_eth').notNull(),
    finalized_cost_eth: numeric('finalized_cost_eth').notNull(),
    finality_cost_eth: numeric('finality_cost_eth').notNull(),
    commit_cost_usd: numeric('commit_cost_usd').notNull(),
    finalized_cost_usd: numeric('finalized_cost_usd').notNull(),
    finality_cost_usd: numeric('finality_cost_usd').notNull(),
    commit_tx_hash: varchar('commit_tx_hash').notNull(),
    finalize_tx_hash: varchar('finalize_tx_hash').notNull(),
    batch_link: text('batch_link').notNull(),
  },
  sql`
    WITH
      batch_costs AS (
        SELECT
          batch_id,
          commit_tx_effective_price / 1e18 AS commit_tx_fee_eth,
          finalize_tx_effective_price / 1e18 AS finalize_tx_fee_eth
        FROM
          scroll_batch_receipts
      )
    SELECT
      '534352'::INTEGER as chain_id,
      'scroll' as blockchain,
      sb."number" as batch_num,
      sb.rollup_status as batch_status
      ----- timestamps
    ,
      DATE_TRUNC('second', sb."timestamp") AS created_at,
      DATE_TRUNC('second', sb.committed_at) AS committed_at,
      DATE_TRUNC('second', sb.finalized_at) AS finalized_at,
      DATE_TRUNC('second', sb.finalized_at) - DATE_TRUNC('second', sb."timestamp") AS created_to_finalized_duration,
      total_tx_num as batch_size
      ----- eth costs
    ,
      bc.commit_tx_fee_eth AS commit_cost_eth,
      bc.finalize_tx_fee_eth AS finalized_cost_eth,
      bc.finalize_tx_fee_eth AS finality_cost_eth
      ----- usd costs
    ,
      ROUND((ep.price / 100.0) * bc.commit_tx_fee_eth, 2) AS commit_cost_usd,
      ROUND((ep.price / 100.0) * bc.finalize_tx_fee_eth, 2) AS finalized_cost_usd,
      ROUND((ep.price / 100.0) * bc.finalize_tx_fee_eth, 2) AS finality_cost_usd
      ----- hashses
    ,
      sb.commit_tx_hash,
      sb.finalize_tx_hash
      ----- link
    ,
      'https://scroll.io/rollupscan/batch/' || sb."number"::TEXT as batch_link
    FROM
      scroll_batches sb
      JOIN batch_costs bc ON sb.id = bc.batch_id
      JOIN eth_usd_price ep ON date_trunc('day', sb.finalized_at) = DATE_TRUNC('day', ep."date")
    WHERE
      sb.finalized_at IS NOT NULL
      AND sb.finalized_at < DATE_TRUNC('day', CURRENT_DATE)
    ORDER BY
      sb."number" DESC;
  `
)

export const {
  materializedView: scrollFinalityByPeriod,
  createOrReplace: createOrReplaceScrollFinalityByPeriod,
} = createPgMaterializedView(
  'scroll_finality_by_period',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_finalization_time: text('avg_finalization_time').notNull(),
    avg_batch_size: numeric('avg_batch_size').notNull(),
    avg_commit_cost_eth: numeric('avg_commit_cost_eth').notNull(),
    avg_finalized_cost_eth: numeric('avg_finalized_cost_eth').notNull(),
    avg_finality_cost_eth: numeric('avg_finality_cost_eth').notNull(),
    avg_commit_cost_usd: numeric('avg_commit_cost_usd').notNull(),
    avg_finalized_cost_usd: numeric('avg_finalized_cost_usd').notNull(),
    avg_finality_cost_usd: numeric('avg_finality_cost_usd').notNull(),
  },
  sql`
    WITH
      averages AS (
        SELECT
          '1_day' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_finalized_duration
            )
          ) AS avg_finalization_time,
          AVG(batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(finalized_cost_eth) AS avg_finalized_cost_eth,
          AVG(finality_cost_eth) AS avg_finality_cost_eth
          ------- usd costs
    ,
          AVG(commit_cost_usd) AS avg_commit_cost_usd,
          AVG(finalized_cost_usd) AS avg_finalized_cost_usd,
          AVG(finality_cost_usd) AS avg_finality_cost_usd
        FROM
          scroll_batch_details
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_finalized_duration
            )
          ) AS avg_finalization_time,
          AVG(batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(finalized_cost_eth) AS avg_finalized_cost_eth,
          AVG(finality_cost_eth) AS avg_finality_cost_eth
          ------- usd costs
    ,
          AVG(commit_cost_usd) AS avg_commit_cost_usd,
          AVG(finalized_cost_usd) AS avg_finalized_cost_usd,
          AVG(finality_cost_usd) AS avg_finality_cost_usd
        FROM
          scroll_batch_details
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_finalized_duration
            )
          ) AS avg_finalization_time,
          AVG(batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(finalized_cost_eth) AS avg_finalized_cost_eth,
          AVG(finality_cost_eth) AS avg_finality_cost_eth
          ------- usd costs
    ,
          AVG(commit_cost_usd) AS avg_commit_cost_usd,
          AVG(finalized_cost_usd) AS avg_finalized_cost_usd,
          AVG(finality_cost_usd) AS avg_finality_cost_usd
        FROM
          scroll_batch_details
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_finalized_duration
            )
          ) AS avg_finalization_time,
          AVG(batch_size) AS avg_batch_size
          ------- eth costs
    ,
          AVG(commit_cost_eth) AS avg_commit_cost_eth,
          AVG(finalized_cost_eth) AS avg_finalized_cost_eth,
          AVG(finality_cost_eth) AS avg_finality_cost_eth
          ------- usd costs
    ,
          AVG(commit_cost_usd) AS avg_commit_cost_usd,
          AVG(finalized_cost_usd) AS avg_finalized_cost_usd,
          AVG(finality_cost_usd) AS avg_finality_cost_usd
        FROM
          scroll_batch_details
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '534352'::INTEGER as chain_id,
      'scroll' as blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      TO_CHAR(TO_TIMESTAMP(avg_finalization_time), 'HH24:MI:SS') AS avg_finalization_time,
      ROUND(avg_batch_size) AS avg_batch_size,
      avg_commit_cost_eth,
      avg_finalized_cost_eth,
      avg_finality_cost_eth,
      ROUND((avg_commit_cost_usd), 2) AS avg_commit_cost_usd,
      ROUND((avg_finalized_cost_usd), 2) AS avg_finalized_cost_usd,
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
  materializedView: scrollFinalityNormalizedBy100,
  createOrReplace: createOrReplaceScrollFinalityNormalizedBy100,
} = createPgMaterializedView(
  'scroll_finality_normalized_by_100',
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
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_finalized_duration
            )
          ) AS avg_proven_time,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  created_to_finalized_duration
              ) / batch_size
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(finality_cost_eth / batch_size) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(AVG(finality_cost_usd / batch_size) * 100, 2) AS norm_batch_size_by_100_cost_usd
        FROM
          scroll_batch_details
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_finalized_duration
            )
          ) AS avg_proven_time,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  created_to_finalized_duration
              ) / batch_size
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(finality_cost_eth / batch_size) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(AVG(finality_cost_usd / batch_size) * 100, 2) AS norm_batch_size_by_100_cost_usd
        FROM
          scroll_batch_details
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_finalized_duration
            )
          ) AS avg_proven_time,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  created_to_finalized_duration
              ) / batch_size
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(finality_cost_eth / batch_size) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(AVG(finality_cost_usd / batch_size) * 100, 2) AS norm_batch_size_by_100_cost_usd
        FROM
          scroll_batch_details
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(batch_size) AS avg_batch_size,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                created_to_finalized_duration
            )
          ) AS avg_proven_time,
          MAKE_INTERVAL(
            secs => AVG(
              EXTRACT(
                EPOCH
                FROM
                  created_to_finalized_duration
              ) / batch_size
            ) * 100
          ) AS norm_batch_size_by_100_finality,
          AVG(finality_cost_eth / batch_size) * 100 AS norm_batch_size_by_100_cost_eth,
          ROUND(AVG(finality_cost_usd / batch_size) * 100, 2) AS norm_batch_size_by_100_cost_usd
        FROM
          scroll_batch_details
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '534352'::INTEGER as chain_id,
      'scroll' as blockchain,
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

export const {
  materializedView: scrollDailyFinalizedBatchStats,
  createOrReplace: createOrReplaceScrollDailyFinalizedBatchStats,
} = createPgMaterializedView(
  'scroll_daily_finalized_batch_stats',
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
      TO_CHAR(DATE_TRUNC('day', finalized_at), 'YYYY-MM-DD') AS fin_date -- The date of finalization on L1
    ,
      COUNT(batch_num) AS total_daily_finalized_batch_count -- Total number of batches finalized on L1 each day
    ,
      SUM(batch_size) AS total_daily_finalized_transactions -- Total number of L2 transactions finalized on L1 each day
      ----- eth costs
    ,
      SUM(commit_cost_eth) AS total_daily_commit_cost_eth,
      SUM(finalized_cost_eth) AS total_daily_finalized_cost_eth,
      SUM(finality_cost_eth) AS total_daily_finality_cost_eth
      ----- usd costs
    ,
      SUM(commit_cost_usd) AS total_daily_commit_cost_usd,
      SUM(finalized_cost_usd) AS total_daily_finalized_cost_usd,
      SUM(finality_cost_usd) AS total_daily_finality_cost_usd
    FROM
      scroll_batch_details_mv
    WHERE
      finalized_at < DATE_TRUNC('day', CURRENT_DATE)
    GROUP BY
      DATE_TRUNC('day', finalized_at)
    ORDER BY
      fin_date DESC;
  `
)

const scrollMaterializedViews = [
  scrollBatchCostMV,
  scrollBatchFinalityMv,
  scrollBatchDetails,
  scrollFinalityByPeriod,
  scrollFinalityNormalizedBy100,
  scrollDailyFinalizedBatchStats,
]

export function refreshScrollMaterializedViews() {
  return refreshMaterializedViews(scrollMaterializedViews)
}

const scrollMaterializedViewsCreateOrReplaceFunctions = [
  createOrReplaceScrollBatchCostMV,
  createOrReplaceScrollBatchFinalityMv,
  createOrReplaceScrollBatchDetails,
  createOrReplaceScrollFinalityByPeriod,
  createOrReplaceScrollFinalityNormalizedBy100,
  createOrReplaceScrollDailyFinalizedBatchStats,
]

export function createOrReplaceScrollMaterializedViews() {
  return creatOrReplaceMaterializedViews(
    scrollMaterializedViewsCreateOrReplaceFunctions
  )
}
