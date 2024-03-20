import { BarChart } from '@/components/chart/bar-chart'
import { commonOptions } from '@/components/chart/config'
import { COLORS } from '@/config/colors'
import { getBatchesAvgCosts } from '@/services/polygon-zk-evm/charts'
import type { ChartOptions } from 'chart.js'
import { merge } from 'lodash'

export async function BatchesAvgCost() {
  const { labels, datasets } = await getBatchesAvgCosts()
  const options = merge(commonOptions, {
    scales: {
      ...commonOptions.scales,
      x: { ...commonOptions.scales.x, stacked: true },
    },
  } satisfies ChartOptions<'bar'>)

  return (
    <BarChart
      currency={{ usd: true }}
      options={options}
      data={{
        labels,
        datasets: [
          {
            data: datasets.avgVerificationConstUsd,
            label: 'Average verification cost',
            backgroundColor: COLORS.SECONDARY,
          },
          {
            data: datasets.avgCommitCostUsd,
            label: 'Average commit cost',
            backgroundColor: COLORS.PRIMARY,
          },
        ],
      }}
    />
  )
}
