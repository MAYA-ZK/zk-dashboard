import { LineChart } from '@/components/chart/line-chart'
import { getTransactionCountPerDay } from '@/services/scroll/charts'

export async function DailyTransactionsChart({ days }: { days: number }) {
  const { datasets, labels } = await getTransactionCountPerDay(days)

  if (!datasets.data || (datasets.data && datasets.data.length === 0)) {
    return (
      <div className="flex size-full items-center justify-center">
        No data available
      </div>
    )
  }

  return <LineChart chartData={{ labels, datasets: [datasets] }} unit="day" />
}
