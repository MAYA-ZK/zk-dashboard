import { normalizeChartData } from '@/services/chart'
import { toDate } from 'date-fns'

import { polygonZkEvmDailyFinalizedBatchStats } from '@zk-dashboard/common/database/materialized-view/polygon-zk-evm'
import { db } from '@zk-dashboard/common/database/utils'

export async function getDailyFinalizedStats() {
  const result = await db
    .select({
      finDate: polygonZkEvmDailyFinalizedBatchStats.fin_date,
      totalDailyFinalizedBatchCount:
        polygonZkEvmDailyFinalizedBatchStats.total_daily_finalized_batch_count,
      totalDailyFinalizedTransactions:
        polygonZkEvmDailyFinalizedBatchStats.total_daily_finalized_transactions,
    })
    .from(polygonZkEvmDailyFinalizedBatchStats)

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
      finDate: polygonZkEvmDailyFinalizedBatchStats.fin_date,
      totalDailyFinalityCostUsd:
        polygonZkEvmDailyFinalizedBatchStats.total_daily_finality_cost_usd,
      totalDailyFinalityCostEth:
        polygonZkEvmDailyFinalizedBatchStats.total_daily_finality_cost_eth,
    })
    .from(polygonZkEvmDailyFinalizedBatchStats)

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
