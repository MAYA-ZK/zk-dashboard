'use client'

import { CURRENCY_QUERY_KEY } from '@/app/(dashboard)/dashboard/_components/charts/daily-finalized-cost/constants'
import { useCurrencyState } from '@/app/_utils/query-state'
import { BarChart } from '@/components/chart/bar-chart'
import { commonOptions } from '@/components/chart/config'
import { COLORS } from '@/config/colors'
import type { ChartData } from '@/services/chart'

export function DailyFinalizedCostChartInteractive({
  data,
}: {
  data: ChartData<'totalDailyFinalityCostUsd' | 'totalDailyFinalityCostEth'>
}) {
  const { labels, datasets } = data
  const [currency] = useCurrencyState(CURRENCY_QUERY_KEY)

  return (
    <BarChart
      currency={currency}
      options={commonOptions}
      data={{
        labels,
        datasets: [
          currency === 'usd'
            ? {
                data: datasets.totalDailyFinalityCostUsd,
                label: 'Total daily finality cost (USD)',
                backgroundColor: COLORS.SECONDARY,
              }
            : {
                data: datasets.totalDailyFinalityCostEth,
                label: 'Total daily finality cost (ETH)',
                backgroundColor: COLORS.SECONDARY,
              },
        ],
      }}
    />
  )
}
