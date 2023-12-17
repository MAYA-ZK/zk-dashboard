import { LineChart } from '@/components/chart/line-chart'
import { CACHE_KEY } from '@/config/cache'
import { TIME } from '@/config/time'
import { getAvgBlockTime } from '@/services/scroll/charts'
import { unstable_cache } from 'next/cache'

const cachedGetAvgBlockTime = unstable_cache(
  getAvgBlockTime,
  [CACHE_KEY.SCROLL_AVG_BLOCK_SIZE],
  {
    revalidate: 1 * TIME.HOUR.IN_SECONDS,
    tags: [CACHE_KEY.SCROLL_AVG_BLOCK_SIZE],
  }
)

export async function AverageBlockTimePerDayChart({ days }: { days: number }) {
  const { datasets, labels } = await cachedGetAvgBlockTime(days)

  if (datasets.data && datasets.data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center">
        No data available
      </div>
    )
  }

  return <LineChart chartData={{ labels, datasets: [datasets] }} unit="day" />
}
