import { mergeArrayOfObjectsBy } from '@/lib/utils'
import { BigNumber } from 'bignumber.js'

import {
  scrollAvgCostOfBatchesDateRange,
  scrollBatchAvgDuration,
  scrollNormalizationBatchedTxs,
} from '@zk-dashboard/common/database/materialized-view/scroll'
import { db } from '@zk-dashboard/common/database/utils'

const avgCostOfBatchesDateRangeQuery = db
  .select({
    period: scrollAvgCostOfBatchesDateRange.period,
    avgTxsInsideBatch: scrollAvgCostOfBatchesDateRange.avg_txs_inside_a_batch,
    avgTotalCostEth: scrollAvgCostOfBatchesDateRange.avg_total_cost_eth,
    avgTotalCostUsd: scrollAvgCostOfBatchesDateRange.avg_total_cost_usd,
    avgCommitCostEth: scrollAvgCostOfBatchesDateRange.avg_commit_cost_eth,
    avgVerifyCostEth: scrollAvgCostOfBatchesDateRange.avg_verification_cost_eth,
    avgCommitCostUsd: scrollAvgCostOfBatchesDateRange.avg_commit_cost_usd,
    avgVerifyCostUsd: scrollAvgCostOfBatchesDateRange.avg_verification_cost_usd,
  })
  .from(scrollAvgCostOfBatchesDateRange)
  .prepare('avgCostOfBatchesDateRange')

const avgBatchDurationQuery = db
  .select({
    period: scrollBatchAvgDuration.period,
    avgFinality: scrollBatchAvgDuration.avg_finality,
  })
  .from(scrollBatchAvgDuration)
  .prepare('avgBatchDuration')

const normalizationBatchedTxsQuery = db
  .select({
    period: scrollNormalizationBatchedTxs.period,
    avgTotalEthCostBy100:
      scrollNormalizationBatchedTxs.avg_total_eth_cost_by_100,
    avgTotalUsdCostBy100:
      scrollNormalizationBatchedTxs.avg_total_usd_cost_by_100,
    avgDurationBy100: scrollNormalizationBatchedTxs.avg_duration_by_100,
  })
  .from(scrollNormalizationBatchedTxs)
  .prepare('normalizationBatchedTxs')

export async function getScrollStats() {
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
