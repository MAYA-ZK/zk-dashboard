import { LineChart } from '@/components/chart/line-chart'
import { CACHE_KEY } from '@/config/cache'
import { TIME } from '@/config/time'
import { getGasUsagePerDay } from '@/services/scroll/charts'
import { unstable_cache } from 'next/cache'

const cachedGetGasUsagePerDay = unstable_cache(
  getGasUsagePerDay,
  [CACHE_KEY.SCROLL_GAS_USED_PER_DAY],
  {
    revalidate: 1 * TIME.HOUR.IN_SECONDS,
    tags: [CACHE_KEY.SCROLL_GAS_USED_PER_DAY],
  }
)

export async function TotalGasUsagePerDayChart({ days }: { days: number }) {
  const { datasets, labels } = await cachedGetGasUsagePerDay(days)

  if (datasets.data && datasets.data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center">
        No data available
      </div>
    )
  }

  return <LineChart chartData={{ labels, datasets: [datasets] }} unit="day" />
}
