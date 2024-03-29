import { mergeArrayOfObjectsBy } from '@/lib/utils'

import {
  zkSyncEraFinalityByPeriod,
  zkSyncEraFinalityNormalizedBy100,
} from '@zk-dashboard/common/database/materialized-view/zk-sync-era'
import { db } from '@zk-dashboard/common/database/utils'

const finalityByPeriodQuery = db
  .select({
    period: zkSyncEraFinalityByPeriod.period,
    avgFinalizationTime: zkSyncEraFinalityByPeriod.avg_proven_time,
    avgBatchSize: zkSyncEraFinalityByPeriod.avg_batch_size,
    avgFinalityCostEth: zkSyncEraFinalityByPeriod.avg_finality_cost_eth,
    avgFinalityCostUsd: zkSyncEraFinalityByPeriod.avg_finality_cost_usd,
    avgExecutionTime: zkSyncEraFinalityByPeriod.avg_execution_time,
  })
  .from(zkSyncEraFinalityByPeriod)
  .prepare('finalityByPeriod')

const normalizedBatchSizeBy100Query = db
  .select({
    period: zkSyncEraFinalityNormalizedBy100.period,
    normalizedBatchSizeBy100Finality:
      zkSyncEraFinalityNormalizedBy100.norm_batch_size_by_100_finality,
    normalizedBatchSizeBy100CostEth:
      zkSyncEraFinalityNormalizedBy100.norm_batch_size_by_100_cost_eth,
    normalizedBatchSizeBy100CostUsd:
      zkSyncEraFinalityNormalizedBy100.norm_batch_size_by_100_cost_usd,
  })
  .from(zkSyncEraFinalityNormalizedBy100)
  .prepare('normalizedBatchSizeBy100')

export type ZkSyncEraStats = Awaited<ReturnType<typeof getZkSyncEraStats>>

export async function getZkSyncEraStats() {
  const [finalityByPeriod, normalizedBatchSizeBy100] = await Promise.all([
    finalityByPeriodQuery.execute(),
    normalizedBatchSizeBy100Query.execute(),
  ])

  return mergeArrayOfObjectsBy(
    [...finalityByPeriod, ...normalizedBatchSizeBy100],
    'period'
  )
}
