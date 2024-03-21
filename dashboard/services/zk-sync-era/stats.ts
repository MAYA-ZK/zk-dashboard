import { mergeArrayOfObjectsBy } from '@/lib/utils'
import { BigNumber } from 'bignumber.js'

import {
  zkSyncEraAvgCostOfBatchesDateRange,
  zkSyncEraBatchAvgDuration,
  zkSyncEraNormalizationBatchedTxs,
} from '@zk-dashboard/common/database/materialized-view/zk-sync-era'
import { db } from '@zk-dashboard/common/database/utils'

const avgCostOfBatchesDateRangeQuery = db
  .select({
    period: zkSyncEraAvgCostOfBatchesDateRange.period,
    avgTxsInsideBatch:
      zkSyncEraAvgCostOfBatchesDateRange.avg_txs_inside_a_batch,
    avgTotalCostEth: zkSyncEraAvgCostOfBatchesDateRange.avg_total_cost_eth,
    avgTotalCostUsd: zkSyncEraAvgCostOfBatchesDateRange.avg_total_cost_usd,
    avgCommitCostEth: zkSyncEraAvgCostOfBatchesDateRange.avg_commit_cost_eth,
    avgVerifyCostEth:
      zkSyncEraAvgCostOfBatchesDateRange.avg_verification_cost_eth,
    avgCommitCostUsd: zkSyncEraAvgCostOfBatchesDateRange.avg_commit_cost_usd,
    avgVerifyCostUsd:
      zkSyncEraAvgCostOfBatchesDateRange.avg_verification_cost_usd,
    avgExecuteCostEth: zkSyncEraAvgCostOfBatchesDateRange.avg_execute_cost_eth,
    avgExecuteCostUsd:
      zkSyncEraAvgCostOfBatchesDateRange.avg_est_execute_cost_usd,
  })
  .from(zkSyncEraAvgCostOfBatchesDateRange)
  .prepare('avgCostOfBatchesDateRange')

const avgBatchDurationQuery = db
  .select({
    period: zkSyncEraBatchAvgDuration.period,
    avgFinality: zkSyncEraBatchAvgDuration.avg_finality,
    avgExecution: zkSyncEraBatchAvgDuration.avg_execution,
  })
  .from(zkSyncEraBatchAvgDuration)
  .prepare('avgBatchDuration')

const normalizationBatchedTxsQuery = db
  .select({
    period: zkSyncEraNormalizationBatchedTxs.period,
    avgTotalEthCostBy100:
      zkSyncEraNormalizationBatchedTxs.avg_total_eth_cost_by_100_with_state_diff,
    avgTotalUsdCostBy100:
      zkSyncEraNormalizationBatchedTxs.avg_total_usd_cost_by_100_with_state_diff,
    avgDurationBy100: zkSyncEraNormalizationBatchedTxs.avg_duration_by_100,
  })
  .from(zkSyncEraNormalizationBatchedTxs)
  .prepare('normalizationBatchedTxs')

export async function getZkSyncEraStats() {
  const [avgCostOfBatchesDateRange, avgBatchDuration, normalizationBatchedTxs] =
    await Promise.all([
      (await avgCostOfBatchesDateRangeQuery.execute()).map((item) => ({
        ...item,
        avgTxsCostUsd: BigNumber(item.avgTotalCostUsd)
          .dividedBy(BigNumber(item.avgTxsInsideBatch))
          .toString(),
        avgTxsCostEth: BigNumber(item.avgTotalCostEth)
          .dividedBy(BigNumber(item.avgTxsInsideBatch))
          .toString(),
      })),
      avgBatchDurationQuery.execute(),
      normalizationBatchedTxsQuery.execute(),
    ])

  return mergeArrayOfObjectsBy(
    [
      ...avgCostOfBatchesDateRange,
      ...avgBatchDuration,
      ...normalizationBatchedTxs,
    ],
    'period'
  )
}
