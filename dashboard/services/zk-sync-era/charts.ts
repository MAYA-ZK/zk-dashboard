import { normalizeChartData } from '@/services/chart'
import { toDate } from 'date-fns'

import { zkSyncEraDailyFinalizedBatchStats } from '@zk-dashboard/common/database/materialized-view/zk-sync-era'
import { db } from '@zk-dashboard/common/database/utils'

export async function getDailyFinalizedStats() {
  const result = await db
    .select({
      finDate: zkSyncEraDailyFinalizedBatchStats.fin_date,
      totalDailyFinalizedBatchCount:
        zkSyncEraDailyFinalizedBatchStats.total_daily_finalized_batch_count,
      totalDailyFinalizedTransactions:
        zkSyncEraDailyFinalizedBatchStats.total_daily_finalized_transactions,
    })
    .from(zkSyncEraDailyFinalizedBatchStats)

  return normalizeChartData(result, {
    getLabel: (value) => toDate(value.finDate),
    datasets: {
      totalDailyFinalizedBatchCount: (value) =>
        value.totalDailyFinalizedBatchCount,
      totalDailyFinalizedTransactions: (value) =>
        value.totalDailyFinalizedTransactions,
    },
  })
}

export async function getDailyFinalizedCost() {
  const result = await db
    .select({
      finDate: zkSyncEraDailyFinalizedBatchStats.fin_date,
      totalDailyFinalityCostUsd:
        zkSyncEraDailyFinalizedBatchStats.total_daily_finality_cost_usd,
      totalDailyFinalityCostEth:
        zkSyncEraDailyFinalizedBatchStats.total_daily_finality_cost_eth,
    })
    .from(zkSyncEraDailyFinalizedBatchStats)

  return normalizeChartData(result, {
    getLabel: (value) => toDate(value.finDate),
    datasets: {
      totalDailyFinalityCostUsd: (value) =>
        Number(value.totalDailyFinalityCostUsd),
      totalDailyFinalityCostEth: (value) =>
        Number(value.totalDailyFinalityCostEth),
    },
  })
}
