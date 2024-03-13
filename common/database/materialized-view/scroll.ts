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
import { createPgMaterializedView } from './utils'

// Example of a materialized view.
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
    chain_id: integer('chain_id'),
    blockchain: text('blockchain'),
    batch_num: integer('batch_num'),
    batch_status: varchar('batch_status'),
    batch_created: timestamp('batch_created'),
    batch_committed: timestamp('batch_committed'),
    batch_verified: timestamp('batch_verified'),
    batch_time_duration: interval('batch_time_duration'),
    daily_max_duration: interval('daily_max_duration'),
    daily_avg_duration: interval('daily_avg_duration'),
    daily_min_duration: interval('daily_min_duration'),
    batch_link: text('batch_link'),
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
  materializedView: scrollBatchCreatedMv,
  createOrReplace: createOrReplaceScrollBatchCreatedMv,
} = createPgMaterializedView(
  'scroll_batch_created_mv',
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
          date_trunc('day', finalized_at) as tx_date,
          count(hash) as batch_count,
          count(
            DISTINCT CASE
              WHEN commit_tx_hash IS NOT NULL THEN hash
            END
          ) as batch_count_committed,
          count(
            DISTINCT CASE
              WHEN finalized_at IS NOT NULL THEN hash
            END
          ) as batch_count_verified
        FROM
          scroll_batches
        WHERE
          finalized_at < date_trunc('day', CURRENT_DATE)
        GROUP BY
          1
      ),
      batched_blocks as (
        SELECT
          date_trunc('day', "timestamp") as tx_date,
          count(*) as block_count,
          sum(cardinality(transactions)) as txs_total
        FROM
          scroll_blocks
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
      '534352'::INTEGER as chain_id,
      'scroll' as blockchain,
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
  materializedView: scrollBatchAvgCostMV,
  createOrReplace: createOrReplaceScrollBatchAvgCostMV,
} = createPgMaterializedView(
  'scroll_batch_avg_cost_mv',
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
      scroll_batch_cost_mv
    GROUP BY
      DATE_TRUNC('day', batch_verification)
    ORDER BY
      tx_date DESC;
  `
)
