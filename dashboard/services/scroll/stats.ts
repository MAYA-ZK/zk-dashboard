import { mergeArrayOfObjectsBy } from '@/lib/utils'

import {
  scrollFinalityByPeriod,
  scrollFinalityNormalizedBy100,
} from '@zk-dashboard/common/database/materialized-view/scroll'
import { db } from '@zk-dashboard/common/database/utils'

const finalityByPeriodQuery = db
  .select({
    period: scrollFinalityByPeriod.period,
    avgFinalizationTime: scrollFinalityByPeriod.avg_finalization_time,
    avgBatchSize: scrollFinalityByPeriod.avg_batch_size,
    avgFinalityCostEth: scrollFinalityByPeriod.avg_finality_cost_eth,
    avgFinalityCostUsd: scrollFinalityByPeriod.avg_finality_cost_usd,
  })
  .from(scrollFinalityByPeriod)
  .prepare('finalityByPeriod')

const normalizedBatchSizeBy100Query = db
  .select({
    period: scrollFinalityNormalizedBy100.period,
    normalizedBatchSizeBy100Finality:
      scrollFinalityNormalizedBy100.norm_batch_size_by_100_finality,
    oneTxCostEth: scrollFinalityNormalizedBy100.one_tx_cost_eth,
    oneTxCostUsd: scrollFinalityNormalizedBy100.one_tx_cost_usd,
  })
  .from(scrollFinalityNormalizedBy100)
  .prepare('normalizedBatchSizeBy100')

export type ScrollStats = Awaited<ReturnType<typeof getScrollStats>>

export async function getScrollStats() {
  const [finalityByPeriod, normalizedBatchSizeBy100] = await Promise.all([
    finalityByPeriodQuery.execute(),
    normalizedBatchSizeBy100Query.execute(),
  ])

  return mergeArrayOfObjectsBy(
    [...finalityByPeriod, ...normalizedBatchSizeBy100],
    'period'
  )
}
