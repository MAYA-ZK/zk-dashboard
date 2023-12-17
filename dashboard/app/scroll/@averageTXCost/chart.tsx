import { LineChart } from '@/components/chart/line-chart'
import { avgTxPricePerDay, avgTxPricePerHour } from '@/services/scroll/charts'

import { getEthLastPrice } from '@zk-dashboard/common/integrations/etherscan'

const PER_HOUR_BREAKPOINT = 30

export async function AverageTXCostChart({ days }: { days: number }) {
  const { ethusd } = await getEthLastPrice()

  // const some = await avgTxPricePerDay(days, ethusd)
  const { datasets, labels } =
    days > PER_HOUR_BREAKPOINT
      ? await avgTxPricePerDay(days, ethusd)
      : await avgTxPricePerHour(days, ethusd)

  if (datasets.data && datasets.data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center">
        No data available
      </div>
    )
  }

  return (
    <LineChart
      chartData={{ labels, datasets: [datasets] }}
      unit={days > PER_HOUR_BREAKPOINT ? 'day' : 'hour'}
    />
  )
}
