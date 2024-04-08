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
  materializedView: scrollBatchDetails,
  createOrReplace: createOrReplaceScrollBatchDetails,
} = createPgMaterializedView(
  'scroll_batch_details_mv',
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
  'scroll_finality_by_period_mv',
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
          scroll_batch_details_mv
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
          scroll_batch_details_mv
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
          scroll_batch_details_mv
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
          scroll_batch_details_mv
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
  'scroll_finality_normalized_by_100_mv',
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
    avg_finality_cost_usd: numeric('avg_finality_cost_usd').notNull(),
    avg_finality_cost_eth: numeric('avg_finality_cost_eth').notNull(),
    one_tx_cost_eth: numeric('one_tx_cost_eth').notNull(),
    one_tx_cost_usd: numeric('one_tx_cost_usd').notNull(),
  },
  sql`
    WITH
      date_range AS (
        SELECT
          '1_day' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(finality_cost_usd) AS avg_finality_cost_usd,
          AVG(finality_cost_eth) AS avg_finality_cost_eth,
          AVG(batch_size) AS avg_batch_size,
          AVG(finality_cost_eth / batch_size) AS one_tx_cost_eth,
          AVG(finality_cost_usd / batch_size) AS one_tx_cost_usd,
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
          AVG(finality_cost_usd / batch_size) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          scroll_batch_details_mv
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(finality_cost_usd) AS avg_finality_cost_usd,
          AVG(finality_cost_eth) AS avg_finality_cost_eth,
          AVG(batch_size) AS avg_batch_size,
          AVG(finality_cost_eth / batch_size) AS one_tx_cost_eth,
          AVG(finality_cost_usd / batch_size) AS one_tx_cost_usd,
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
          AVG(finality_cost_usd / batch_size) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          scroll_batch_details_mv
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(finality_cost_usd) AS avg_finality_cost_usd,
          AVG(finality_cost_eth) AS avg_finality_cost_eth,
          AVG(batch_size) AS avg_batch_size,
          AVG(finality_cost_eth / batch_size) AS one_tx_cost_eth,
          AVG(finality_cost_usd / batch_size) AS one_tx_cost_usd,
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
          AVG(finality_cost_usd / batch_size) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          scroll_batch_details_mv
        WHERE
          finalized_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(finalized_at) AS start_date,
          MAX(finalized_at) AS end_date,
          AVG(finality_cost_usd) AS avg_finality_cost_usd,
          AVG(finality_cost_eth) AS avg_finality_cost_eth,
          AVG(batch_size) AS avg_batch_size,
          AVG(finality_cost_eth / batch_size) AS one_tx_cost_eth,
          AVG(finality_cost_usd / batch_size) AS one_tx_cost_usd,
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
          AVG(finality_cost_usd / batch_size) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          scroll_batch_details_mv
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
      avg_finality_cost_usd,
      avg_finality_cost_eth,
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
  materializedView: scrollDailyFinalizedBatchStats,
  createOrReplace: createOrReplaceScrollDailyFinalizedBatchStats,
} = createPgMaterializedView(
  'scroll_daily_finalized_batch_stats_mv',
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
  scrollBatchDetails,
  scrollFinalityByPeriod,
  scrollFinalityNormalizedBy100,
  scrollDailyFinalizedBatchStats,
]

export function refreshScrollMaterializedViews() {
  return refreshMaterializedViews(scrollMaterializedViews)
}

const scrollMaterializedViewsCreateOrReplaceFunctions = [
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
