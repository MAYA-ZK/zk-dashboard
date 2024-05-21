import { mergeArrayOfObjectsBy } from '@/lib/utils'

import {
  lineaFinalityByPeriod,
  lineaFinalityNormalizedBy100,
} from '@zk-dashboard/common/database/materialized-view/linea'
import { db } from '@zk-dashboard/common/database/utils'

const finalityByPeriodQuery = db
  .select({
    period: lineaFinalityByPeriod.period,
    avgFinalizationTime: lineaFinalityByPeriod.avg_finalization_time,
    avgBatchSize: lineaFinalityByPeriod.avg_batch_size,
    avgFinalityCostEth: lineaFinalityByPeriod.avg_finality_cost_eth,
    avgFinalityCostUsd: lineaFinalityByPeriod.avg_finality_cost_usd,
  })
  .from(lineaFinalityByPeriod)
  .prepare('finalityByPeriod')

const normalizedBatchSizeBy100Query = db
  .select({
    period: lineaFinalityNormalizedBy100.period,
    normalizedBatchSizeBy100Finality:
      lineaFinalityNormalizedBy100.norm_batch_size_by_100_finality,
    oneTxCostEth: lineaFinalityNormalizedBy100.one_tx_cost_eth,
    oneTxCostUsd: lineaFinalityNormalizedBy100.one_tx_cost_usd,
  })
  .from(lineaFinalityNormalizedBy100)
  .prepare('normalizedBatchSizeBy100')

export type LineaStats = Awaited<ReturnType<typeof getLineaStats>>

export async function getLineaStats() {
  const [finalityByPeriod, normalizedBatchSizeBy100] = await Promise.all([
    finalityByPeriodQuery.execute(),
    normalizedBatchSizeBy100Query.execute(),
  ])

  return mergeArrayOfObjectsBy(
    [...finalityByPeriod, ...normalizedBatchSizeBy100],
    'period'
  )
}
