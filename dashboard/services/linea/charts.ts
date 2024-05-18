import { normalizeChartData } from '@/services/chart'
import { toDate } from 'date-fns'

import { lineaFinalizedProofDetails } from '@zk-dashboard/common/database/materialized-view/linea'
import { db } from '@zk-dashboard/common/database/utils'

export async function getDailyFinalizedStats() {
  const result = await db
    .select({
      finDate: lineaFinalizedProofDetails.l1_block_date,
      totalDailyFinalizedBatchCount:
        lineaFinalizedProofDetails.daily_total_l1_proofs,
      totalDailyFinalizedTransactions:
        lineaFinalizedProofDetails.daily_l2_total_txs_sum,
    })
    .from(lineaFinalizedProofDetails)

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
      finDate: lineaFinalizedProofDetails.l1_block_date,
      totalDailyFinalityCostUsd: lineaFinalizedProofDetails.tx_fee_usd,
      totalDailyFinalityCostEth: lineaFinalizedProofDetails.tx_fee_eth,
    })
    .from(lineaFinalizedProofDetails)

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
