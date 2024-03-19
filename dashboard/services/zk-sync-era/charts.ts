import { normalizeChartData } from '@/services/chart'

import {
  zkSyncEraBatchAvgCostMv,
  zkSyncEraBatchCreatedMv,
} from '@zk-dashboard/common/database/materialized-view/zk-sync-era'
import { db } from '@zk-dashboard/common/database/utils'

/**
 *  Batches that are created daily with the average number of transactions per batch
 */
export async function getDailyCreatedBatchesWithAverage() {
  const result = await db.select().from(zkSyncEraBatchCreatedMv)

  return normalizeChartData(result, {
    getLabel: (value) => value.tx_date,
    datasets: {
      avgTxsPerBatch: (value) => value.avg_txs_per_batch,
      batchCount: (value) => value.batch_count,
    },
  })
}

export async function getBatchesAvgCosts() {
  const result = await db.select().from(zkSyncEraBatchAvgCostMv)

  return normalizeChartData(result, {
    getLabel: (value) => value.tx_date,
    datasets: {
      avgCommitCostUsd: (value) => Number(value.avg_commit_cost_usd),
      avgVerificationConstUsd: (value) =>
        Number(value.avg_verification_cost_usd),
    },
  })
}
