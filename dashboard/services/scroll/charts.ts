import { normalizeChartData } from '@/services/chart'
import { toDate } from 'date-fns'

import { scrollDailyFinalizedBatchStats } from '@zk-dashboard/common/database/materialized-view/scroll'
import { db } from '@zk-dashboard/common/database/utils'

export async function getDailyFinalizedStats() {
  const result = await db
    .select({
      finDate: scrollDailyFinalizedBatchStats.fin_date,
      totalDailyFinalizedBatchCount:
        scrollDailyFinalizedBatchStats.total_daily_finalized_batch_count,
      totalDailyFinalizedTransactions:
        scrollDailyFinalizedBatchStats.total_daily_finalized_transactions,
    })
    .from(scrollDailyFinalizedBatchStats)

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
      finDate: scrollDailyFinalizedBatchStats.fin_date,
      totalDailyFinalityCostUsd:
        scrollDailyFinalizedBatchStats.total_daily_finality_cost_usd,
      totalDailyFinalityCostEth:
        scrollDailyFinalizedBatchStats.total_daily_finality_cost_eth,
    })
    .from(scrollDailyFinalizedBatchStats)

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
