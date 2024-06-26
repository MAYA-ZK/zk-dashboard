import { Chart } from '@/components/chart/chart'
import { commonOptions } from '@/components/chart/config'
import type { Blockchain } from '@/config/blockchain'
import { COLORS } from '@/config/colors'
import type { ChartData } from '@/services/chart'
import { getDailyFinalizedStats as getDailyFinalizedStatsLinea } from '@/services/linea/charts'
import { getDailyFinalizedStats as getDailyFinalizedStatsPolygonZkEvm } from '@/services/polygon-zk-evm/charts'
import { getDailyFinalizedStats as getDailyFinalizedStatsScroll } from '@/services/scroll/charts'
import { getDailyFinalizedStats as getDailyFinalizedStatsZkSyncEra } from '@/services/zk-sync-era/charts'

const getBlockchainData = {
  'zk-sync-era': getDailyFinalizedStatsZkSyncEra,
  scroll: getDailyFinalizedStatsScroll,
  'polygon-zk-evm': getDailyFinalizedStatsPolygonZkEvm,
  linea: getDailyFinalizedStatsLinea,
} satisfies Record<
  Blockchain,
  () => Promise<
    ChartData<
      'totalDailyFinalizedBatchCount' | 'totalDailyFinalizedTransactions'
    >
  >
>

export async function DailyFinalizedBatchesChart({
  blockchain,
}: {
  blockchain: Blockchain
}) {
  const { datasets, labels } = await getBlockchainData[blockchain]()

  return (
    <Chart
      options={{
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        },
      }}
      type="bar"
      data={{
        labels,
        datasets: [
          {
            data: datasets.totalDailyFinalizedTransactions,
            label: 'Daily Proven Transactions',
            borderColor: COLORS.SECONDARY,
            backgroundColor: COLORS.SECONDARY,
            type: 'line',
            yAxisID: 'y1',
          },
          {
            data: datasets.totalDailyFinalizedBatchCount,
            label: 'Daily Proven Batches',
            borderColor: COLORS.PRIMARY,
            backgroundColor: COLORS.PRIMARY,
            type: 'bar',
          },
        ],
      }}
    />
  )
}
