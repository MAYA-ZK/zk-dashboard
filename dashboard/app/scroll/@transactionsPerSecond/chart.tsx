import { LineChart } from '@/components/chart/line-chart'
import { txPerSecond } from '@/services/scroll/charts'

export async function TransactionsPerSecondChart({ days }: { days: number }) {
  const { labels, datasets } = await txPerSecond(days)
  if (!datasets) {
    return (
      <div className="flex size-full items-center justify-center">
        No data available
      </div>
    )
  }

  return (
    <div className="size-full">
      <LineChart
        chartData={{
          labels,
          datasets: [
            { data: datasets.min, label: 'Min', borderColor: 'pink' },
            { data: datasets.avg, label: 'Avg', borderColor: 'blue' },
            { data: datasets.max, label: 'Max', borderColor: 'green' },
          ],
        }}
        unit="day"
      />
    </div>
  )
}
