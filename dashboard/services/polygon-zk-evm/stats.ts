import { mergeArrayOfObjectsBy } from '@/lib/utils'
import { BigNumber } from 'bignumber.js'

import {
  polygonZkEvmAvgCostOfBatchesDateRange,
  polygonZkEvmBatchAvgDuration,
  polygonZkEvmNormalizationBatchedTxs,
} from '@zk-dashboard/common/database/materialized-view/polygon-zk-evm'
import { db } from '@zk-dashboard/common/database/utils'

const avgCostOfBatchesDateRangeQuery = db
  .select({
    period: polygonZkEvmAvgCostOfBatchesDateRange.period,
    avgTxsInsideBatch:
      polygonZkEvmAvgCostOfBatchesDateRange.avg_txs_inside_a_batch,
    avgTotalCostEth: polygonZkEvmAvgCostOfBatchesDateRange.avg_total_cost_eth,
    avgTotalCostUsd: polygonZkEvmAvgCostOfBatchesDateRange.avg_total_cost_usd,
    avgCommitCostEth: polygonZkEvmAvgCostOfBatchesDateRange.avg_commit_cost_eth,
    avgVerifyCostEth:
      polygonZkEvmAvgCostOfBatchesDateRange.avg_verification_cost_eth,
    avgCommitCostUsd: polygonZkEvmAvgCostOfBatchesDateRange.avg_commit_cost_usd,
    avgVerifyCostUsd:
      polygonZkEvmAvgCostOfBatchesDateRange.avg_verification_cost_usd,
  })
  .from(polygonZkEvmAvgCostOfBatchesDateRange)
  .prepare('avgCostOfBatchesDateRange')

const avgBatchDurationQuery = db
  .select({
    period: polygonZkEvmBatchAvgDuration.period,
    avgFinality: polygonZkEvmBatchAvgDuration.avg_finality,
  })
  .from(polygonZkEvmBatchAvgDuration)
  .prepare('avgBatchDuration')

const normalizationBatchedTxsQuery = db
  .select({
    period: polygonZkEvmNormalizationBatchedTxs.period,
    avgTotalEthCostBy100:
      polygonZkEvmNormalizationBatchedTxs.avg_total_eth_cost_by_100,
    avgTotalUsdCostBy100:
      polygonZkEvmNormalizationBatchedTxs.avg_total_usd_cost_by_100,
    avgDurationBy100: polygonZkEvmNormalizationBatchedTxs.avg_duration_by_100,
  })
  .from(polygonZkEvmNormalizationBatchedTxs)
  .prepare('normalizationBatchedTxs')

export type PolygonZkEvmStats = Awaited<ReturnType<typeof getPolygonZkEvmStats>>

export async function getPolygonZkEvmStats() {
  const [avgCostOfBatchesDateRange, avgBatchDuration, normalizationBatchedTxs] =
    await Promise.all([
      (await avgCostOfBatchesDateRangeQuery.execute()).map((item) => ({
        ...item,
        avgTxsInsideBatch: BigNumber(item.avgTxsInsideBatch)
          .decimalPlaces(0)
          .toString(),
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
