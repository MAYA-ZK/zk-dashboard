import { sql } from 'drizzle-orm'
import { bigint, integer, interval, numeric, text } from 'drizzle-orm/pg-core'

import { period } from './common'
import {
  creatOrReplaceMaterializedViews,
  createPgMaterializedView,
  refreshMaterializedViews,
} from './utils'

export const {
  materializedView: lineaFinalizedProofDetails,
  createOrReplace: createOrReplaceLineaFinalizedProofDetails,
} = createPgMaterializedView(
  'linea_finalized_proof_details_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    l1_block_date: text('l1_block_date').notNull(),
    daily_total_l1_proofs: bigint('daily_total_l1_proofs', {
      mode: 'number',
    }).notNull(),
    daily_l2_total_txs_sum: bigint('daily_l2_total_txs_sum', {
      mode: 'number',
    }).notNull(),
    avg_duration_sec: numeric('avg_duration_sec').notNull(),
    tx_fee_eth: numeric('tx_fee_eth').notNull(),
    tx_fee_usd: numeric('tx_fee_usd').notNull(),
    avg_txs_per_proof: numeric('avg_txs_per_proof').notNull(),
    avg_cost_per_proof_eth: numeric('avg_cost_per_proof_eth').notNull(),
    avg_cost_per_proof_usd: numeric('avg_cost_per_proof_usd').notNull(),
  },
  sql`
    WITH
      linea_l1_daily_proofs AS (
        SELECT
          DATE ("timestamp") AS l1_block_date,
          MIN("timestamp") AS l1_first_proof,
          MAX("timestamp") AS l1_last_proof,
          COUNT("hash") AS total_proofs,
          AVG(
            EXTRACT(
              EPOCH
              FROM
                ("timestamp" - decoded_last_finalized_timestamp)
            )
          ) AS avg_duration_sec,
          SUM(gas_price * gas_used) / 1e18 AS tx_fee_eth
        FROM
          linea_transactions
        WHERE
          "methodId" = '0xd630280f'
          OR "methodId" = '0xabffac32'
        GROUP BY
          DATE ("timestamp")
      )
    SELECT
      '59144'::INTEGER AS chain_id,
      'linea' AS blockchain,
      lp.l1_block_date,
      lp.total_proofs AS daily_total_l1_proofs,
      SUM(lb.transactions_count) AS daily_l2_total_txs_sum,
      lp.avg_duration_sec,
      lp.tx_fee_eth,
      ROUND((ep.price / 100.0) * lp.tx_fee_eth, 2) AS tx_fee_usd,
      ROUND(
        SUM(lb.transactions_count) / NULLIF(lp.total_proofs, 0)
      ) AS avg_txs_per_proof,
      lp.tx_fee_eth / NULLIF(lp.total_proofs, 0) AS avg_cost_per_proof_eth,
      ROUND(
        (ep.price / 100.0) * (lp.tx_fee_eth / NULLIF(lp.total_proofs, 0)),
        2
      ) AS avg_cost_per_proof_usd
    FROM
      linea_blocks lb
      JOIN linea_l1_daily_proofs lp ON lb."timestamp" BETWEEN lp.l1_first_proof AND lp.l1_last_proof
      JOIN eth_usd_price ep ON lp.l1_block_date = DATE_TRUNC('day', ep."date")
    WHERE
      lp.l1_block_date <> CURRENT_DATE
    GROUP BY
      lp.l1_block_date,
      lp.total_proofs,
      lp.avg_duration_sec,
      lp.tx_fee_eth,
      ep.price
    ORDER BY
      lp.l1_block_date DESC;
  `
)

export const {
  materializedView: lineaFinalityByPeriod,
  createOrReplace: createOrReplaceLineaFinalityByPeriod,
} = createPgMaterializedView(
  'linea_finality_by_period_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    period: period('period').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    avg_finalization_time: text('avg_finalization_time').notNull(),
    avg_batch_size: numeric('avg_batch_size').notNull(),
    avg_finality_cost_eth: numeric('avg_finality_cost_eth').notNull(),
    avg_finality_cost_usd: numeric('avg_finality_cost_usd').notNull(),
  },
  sql`
    WITH
      averages AS (
        SELECT
          '1_day' AS period,
          MIN(l1_block_date) AS start_date,
          MAX(l1_block_date) AS end_date,
          AVG(avg_duration_sec) AS avg_finalization_time,
          AVG(avg_txs_per_proof) AS avg_batch_size,
          AVG(avg_cost_per_proof_eth) AS avg_finality_cost_eth,
          AVG(avg_cost_per_proof_usd) AS avg_finality_cost_usd
        FROM
          linea_finalized_proof_details_mv
        WHERE
          l1_block_date >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(l1_block_date) AS start_date,
          MAX(l1_block_date) AS end_date,
          AVG(avg_duration_sec) AS avg_finalization_time,
          AVG(avg_txs_per_proof) AS avg_batch_size,
          AVG(avg_cost_per_proof_eth) AS avg_finality_cost_eth,
          AVG(avg_cost_per_proof_usd) AS avg_finality_cost_usd
        FROM
          linea_finalized_proof_details_mv
        WHERE
          l1_block_date >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(l1_block_date) AS start_date,
          MAX(l1_block_date) AS end_date,
          AVG(avg_duration_sec) AS avg_finalization_time,
          AVG(avg_txs_per_proof) AS avg_batch_size,
          AVG(avg_cost_per_proof_eth) AS avg_finality_cost_eth,
          AVG(avg_cost_per_proof_usd) AS avg_finality_cost_usd
        FROM
          linea_finalized_proof_details_mv
        WHERE
          l1_block_date >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(l1_block_date) AS start_date,
          MAX(l1_block_date) AS end_date,
          AVG(avg_duration_sec) AS avg_finalization_time,
          AVG(avg_txs_per_proof) AS avg_batch_size,
          AVG(avg_cost_per_proof_eth) AS avg_finality_cost_eth,
          AVG(avg_cost_per_proof_usd) AS avg_finality_cost_usd
        FROM
          linea_finalized_proof_details_mv
        WHERE
          l1_block_date >= CURRENT_DATE - INTERVAL '90 days'
      )
    SELECT
      '59144'::INTEGER AS chain_id,
      'linea' AS blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      TO_CHAR(TO_TIMESTAMP(avg_finalization_time), 'HH24:MI:SS') AS avg_finalization_time,
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
  materializedView: lineaFinalityNormalizedBy100,
  createOrReplace: createOrReplaceLineaFinalityNormalizedBy100,
} = createPgMaterializedView(
  'linea_finality_normalized_by_100_mv',
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
      date_range AS (
        SELECT
          '1_day' AS period,
          MIN(l1_block_date) AS start_date,
          MAX(l1_block_date) AS end_date,
          AVG(avg_cost_per_proof_eth) AS avg_finality_cost_eth,
          AVG(avg_cost_per_proof_usd) AS avg_finality_cost_usd,
          AVG(avg_txs_per_proof) AS avg_batch_size,
          AVG(
            avg_cost_per_proof_eth / NULLIF(avg_txs_per_proof, 0)
          ) AS one_tx_cost_eth,
          AVG(
            avg_cost_per_proof_usd / NULLIF(avg_txs_per_proof, 0)
          ) AS one_tx_cost_usd,
          AVG(avg_duration_sec) AS avg_proven_time,
          AVG(avg_duration_sec / NULLIF(avg_txs_per_proof, 0)) * 100 AS avg_time_per_100_tx,
          AVG(
            avg_cost_per_proof_eth / NULLIF(avg_txs_per_proof, 0)
          ) * 100 AS norm_batch_size_by_100_cost_eth,
          AVG(
            avg_cost_per_proof_usd / NULLIF(avg_txs_per_proof, 0)
          ) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          linea_finalized_proof_details_mv
        WHERE
          l1_block_date >= CURRENT_DATE - INTERVAL '1 days'
        GROUP BY
          period
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(l1_block_date) AS start_date,
          MAX(l1_block_date) AS end_date,
          AVG(avg_cost_per_proof_eth) AS avg_finality_cost_eth,
          AVG(avg_cost_per_proof_usd) AS avg_finality_cost_usd,
          AVG(avg_txs_per_proof) AS avg_batch_size,
          AVG(
            avg_cost_per_proof_eth / NULLIF(avg_txs_per_proof, 0)
          ) AS one_tx_cost_eth,
          AVG(
            avg_cost_per_proof_usd / NULLIF(avg_txs_per_proof, 0)
          ) AS one_tx_cost_usd,
          AVG(avg_duration_sec) AS avg_proven_time,
          AVG(avg_duration_sec / NULLIF(avg_txs_per_proof, 0)) * 100 AS avg_time_per_100_tx,
          AVG(
            avg_cost_per_proof_eth / NULLIF(avg_txs_per_proof, 0)
          ) * 100 AS norm_batch_size_by_100_cost_eth,
          AVG(
            avg_cost_per_proof_usd / NULLIF(avg_txs_per_proof, 0)
          ) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          linea_finalized_proof_details_mv
        WHERE
          l1_block_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY
          period
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(l1_block_date) AS start_date,
          MAX(l1_block_date) AS end_date,
          AVG(avg_cost_per_proof_eth) AS avg_finality_cost_eth,
          AVG(avg_cost_per_proof_usd) AS avg_finality_cost_usd,
          AVG(avg_txs_per_proof) AS avg_batch_size,
          AVG(
            avg_cost_per_proof_eth / NULLIF(avg_txs_per_proof, 0)
          ) AS one_tx_cost_eth,
          AVG(
            avg_cost_per_proof_usd / NULLIF(avg_txs_per_proof, 0)
          ) AS one_tx_cost_usd,
          AVG(avg_duration_sec) AS avg_proven_time,
          AVG(avg_duration_sec / NULLIF(avg_txs_per_proof, 0)) * 100 AS avg_time_per_100_tx,
          AVG(
            avg_cost_per_proof_eth / NULLIF(avg_txs_per_proof, 0)
          ) * 100 AS norm_batch_size_by_100_cost_eth,
          AVG(
            avg_cost_per_proof_usd / NULLIF(avg_txs_per_proof, 0)
          ) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          linea_finalized_proof_details_mv
        WHERE
          l1_block_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY
          period
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(l1_block_date) AS start_date,
          MAX(l1_block_date) AS end_date,
          AVG(avg_cost_per_proof_eth) AS avg_finality_cost_eth,
          AVG(avg_cost_per_proof_usd) AS avg_finality_cost_usd,
          AVG(avg_txs_per_proof) AS avg_batch_size,
          AVG(
            avg_cost_per_proof_eth / NULLIF(avg_txs_per_proof, 0)
          ) AS one_tx_cost_eth,
          AVG(
            avg_cost_per_proof_usd / NULLIF(avg_txs_per_proof, 0)
          ) AS one_tx_cost_usd,
          AVG(avg_duration_sec) AS avg_proven_time,
          AVG(avg_duration_sec / NULLIF(avg_txs_per_proof, 0)) * 100 AS avg_time_per_100_tx,
          AVG(
            avg_cost_per_proof_eth / NULLIF(avg_txs_per_proof, 0)
          ) * 100 AS norm_batch_size_by_100_cost_eth,
          AVG(
            avg_cost_per_proof_usd / NULLIF(avg_txs_per_proof, 0)
          ) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          linea_finalized_proof_details_mv
        WHERE
          l1_block_date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY
          period
      )
    SELECT
      '59144'::INTEGER AS chain_id,
      'linea' AS blockchain,
      period,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      ROUND(avg_batch_size) AS avg_batch_size,
      avg_finality_cost_usd,
      avg_finality_cost_eth,
      CAST(one_tx_cost_eth as NUMERIC),
      CAST(one_tx_cost_usd as NUMERIC),
      norm_batch_size_by_100_cost_eth,
      norm_batch_size_by_100_cost_usd,
      TO_CHAR(TO_TIMESTAMP(avg_time_per_100_tx), 'HH24:MI:SS') AS norm_batch_size_by_100_finality
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

const lineaMaterializedViews = [
  lineaFinalizedProofDetails,
  lineaFinalityByPeriod,
  lineaFinalityNormalizedBy100,
]

export function refreshLineaMaterializedViews() {
  return refreshMaterializedViews(lineaMaterializedViews)
}

const lineaMaterializedViewsCreateOrReplaceFunctions = [
  createOrReplaceLineaFinalizedProofDetails,
  createOrReplaceLineaFinalityByPeriod,
  createOrReplaceLineaFinalityNormalizedBy100,
]

export function createOrReplaceLineaMaterializedViews() {
  return creatOrReplaceMaterializedViews(
    lineaMaterializedViewsCreateOrReplaceFunctions
  )
}
