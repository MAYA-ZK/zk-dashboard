import { DailyFinalizedCostChartInteractive } from '@/app/(dashboard)/dashboard/_components/charts/daily-finalized-cost/chart-interactive'
import type { Blockchain } from '@/config/blockchain'
import type { ChartData } from '@/services/chart'
import { getDailyFinalizedCost as getDailyFinalizedCostLinea } from '@/services/linea/charts'
import { getDailyFinalizedCost as getDailyFinalizedCostPolygon } from '@/services/polygon-zk-evm/charts'
import { getDailyFinalizedCost as getDailyFinalizedCostScroll } from '@/services/scroll/charts'
import { getDailyFinalizedCost as getDailyFinalizedCostZkSyncEra } from '@/services/zk-sync-era/charts'

const getBlockchainData = {
  'zk-sync-era': getDailyFinalizedCostZkSyncEra,
  scroll: getDailyFinalizedCostScroll,
  'polygon-zk-evm': getDailyFinalizedCostPolygon,
  linea: getDailyFinalizedCostLinea,
} satisfies Record<
  Blockchain,
  () => Promise<
    ChartData<'totalDailyFinalityCostUsd' | 'totalDailyFinalityCostEth'>
  >
>

export async function DailyFinalizedCostChart({
  blockchain,
}: {
  blockchain: Blockchain
}) {
  const data = await getBlockchainData[blockchain]()

  return <DailyFinalizedCostChartInteractive data={data} />
}
