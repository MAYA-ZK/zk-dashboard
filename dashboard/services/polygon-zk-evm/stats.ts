import { mergeArrayOfObjectsBy } from '@/lib/utils'

import {
  polygonZkEvmFinalityByPeriod,
  polygonZkEvmFinalityNormalizedBy100,
} from '@zk-dashboard/common/database/materialized-view/polygon-zk-evm'
import { db } from '@zk-dashboard/common/database/utils'

const finalityByPeriodQuery = db
  .select({
    period: polygonZkEvmFinalityByPeriod.period,
    avgFinalizationTime: polygonZkEvmFinalityByPeriod.avg_verification_time,
    avgBatchSize: polygonZkEvmFinalityByPeriod.avg_batch_size,
    avgFinalityCostEth: polygonZkEvmFinalityByPeriod.avg_finality_cost_eth,
    avgFinalityCostUsd: polygonZkEvmFinalityByPeriod.avg_finality_cost_usd,
  })
  .from(polygonZkEvmFinalityByPeriod)
  .prepare('finalityByPeriod')

const normalizedBatchSizeBy100Query = db
  .select({
    period: polygonZkEvmFinalityNormalizedBy100.period,
    normalizedBatchSizeBy100Finality:
      polygonZkEvmFinalityNormalizedBy100.norm_batch_size_by_100_finality,
    oneTxCostEth: polygonZkEvmFinalityNormalizedBy100.one_tx_cost_eth,
    oneTxCostUsd: polygonZkEvmFinalityNormalizedBy100.one_tx_cost_usd,
  })
  .from(polygonZkEvmFinalityNormalizedBy100)
  .prepare('normalizedBatchSizeBy100')

export type PolygonZkEvmStats = Awaited<ReturnType<typeof getPolygonZkEvmStats>>

export async function getPolygonZkEvmStats() {
  const [finalityByPeriod, normalizedBatchSizeBy100] = await Promise.all([
    finalityByPeriodQuery.execute(),
    normalizedBatchSizeBy100Query.execute(),
  ])

  return mergeArrayOfObjectsBy(
    [...finalityByPeriod, ...normalizedBatchSizeBy100],
    'period'
  )
}
