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
  materializedView: zkSyncEraBatchDetails,
  createOrReplace: createOrReplaceZkSyncEraBatchDetails,
} = createPgMaterializedView(
  'zk_sync_batch_details_mv',
  {
    chain_id: integer('chain_id').notNull(),
    blockchain: text('blockchain').notNull(),
    batch_num: bigint('batch_num', { mode: 'number' }).notNull(),
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
    execute_size: bigint('execute_size', { mode: 'number' }).notNull(),
    batch_size: bigint('batch_size', { mode: 'number' }).notNull(),
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
  `zk_sync_era_finality_by_period_mv`,
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
  'zk_sync_era_finality_normalized_by_100_mv',
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
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(finality_cost_usd) AS avg_finality_cost_usd,
          AVG(finality_cost_eth) AS avg_finality_cost_eth,
          AVG(batch_size) AS avg_batch_size,
          AVG(finality_cost_eth / batch_size) AS one_tx_cost_eth,
          AVG(finality_cost_usd / batch_size) AS one_tx_cost_usd,
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
          AVG(finality_cost_usd / batch_size) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '1 days'
        UNION ALL
        SELECT
          '7_days' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(finality_cost_usd) AS avg_finality_cost_usd,
          AVG(finality_cost_eth) AS avg_finality_cost_eth,
          AVG(batch_size) AS avg_batch_size,
          AVG(finality_cost_eth / batch_size) AS one_tx_cost_eth,
          AVG(finality_cost_usd / batch_size) AS one_tx_cost_usd,
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
          AVG(finality_cost_usd / batch_size) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT
          '30_days' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(finality_cost_usd) AS avg_finality_cost_usd,
          AVG(finality_cost_eth) AS avg_finality_cost_eth,
          AVG(batch_size) AS avg_batch_size,
          AVG(finality_cost_eth / batch_size) AS one_tx_cost_eth,
          AVG(finality_cost_usd / batch_size) AS one_tx_cost_usd,
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
          AVG(finality_cost_usd / batch_size) * 100 AS norm_batch_size_by_100_cost_usd
        FROM
          zk_sync_batch_details_mv
        WHERE
          executed_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT
          '90_days' AS period,
          MIN(executed_at) AS start_date,
          MAX(executed_at) AS end_date,
          AVG(finality_cost_usd) AS avg_finality_cost_usd,
          AVG(finality_cost_eth) AS avg_finality_cost_eth,
          AVG(batch_size) AS avg_batch_size,
          AVG(finality_cost_eth / batch_size) AS one_tx_cost_eth,
          AVG(finality_cost_usd / batch_size) AS one_tx_cost_usd,
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
          AVG(finality_cost_usd / batch_size) * 100 AS norm_batch_size_by_100_cost_usd
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
  materializedView: zkSyncEraDailyFinalizedBatchStats,
  createOrReplace: createOrReplaceZkSyncEraDailyFinalizedBatchStats,
} = createPgMaterializedView(
  'zk_sync_era_daily_finalized_batch_stats_mv',
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
      TO_CHAR(DATE_TRUNC('day', executed_at), 'YYYY-MM-DD') AS fin_date -- The date of finalization on L1
    ,
      COUNT(batch_num) AS total_daily_finalized_batch_count -- Total number of batches finalized on L1 each day
    ,
      SUM(batch_size) AS total_daily_finalized_transactions -- Total number of L2 transactions finalized on L1 each day
      ----- eth costs
    ,
      SUM(commit_cost_eth) AS total_daily_commit_cost_eth,
      SUM(prove_cost_eth) AS total_daily_prove_cost_eth,
      SUM(finality_cost_eth) AS total_daily_finality_cost_eth
      ----- usd costs
    ,
      SUM(commit_cost_usd) AS total_daily_commit_cost_usd,
      SUM(prove_cost_usd) AS total_daily_prove_cost_usd,
      SUM(finality_cost_usd) AS total_daily_finality_cost_usd
    FROM
      zk_sync_batch_details_mv
    WHERE
      executed_at < DATE_TRUNC('day', CURRENT_DATE)
    GROUP BY
      DATE_TRUNC('day', executed_at)
    ORDER BY
      fin_date DESC;
  `
)

const zkSyncEraMaterializedViews = [
  zkSyncEraBatchDetails,
  zkSyncEraFinalityByPeriod,
  zkSyncEraFinalityNormalizedBy100,
  zkSyncEraDailyFinalizedBatchStats,
]

export function refreshZkSyncEraMaterializedViews() {
  return refreshMaterializedViews(zkSyncEraMaterializedViews)
}

const zkSyncEraMaterializedViewsCreateOrReplaceFunctions = [
  createOrReplaceZkSyncEraBatchDetails,
  createOrReplaceZkSyncEraFinalityByPeriod,
  createOrReplaceZkSyncEraFinalityNormalizedBy100,
  createOrReplaceZkSyncEraDailyFinalizedBatchStats,
]

export function creatOrReplaceZkSyncEraMaterializedViews() {
  return creatOrReplaceMaterializedViews(
    zkSyncEraMaterializedViewsCreateOrReplaceFunctions
  )
}
