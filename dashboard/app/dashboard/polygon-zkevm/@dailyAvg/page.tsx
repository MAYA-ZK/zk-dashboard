import { DailyCreatedBatchesWithAverage } from '@/app/dashboard/polygon-zkevm/@dailyAvg/chart'
import { ChartHeading } from '@/components/chart/chart-heading'
import { ChartWrapper } from '@/components/chart/wrapper'

export default async function Page() {
  return (
    <div className="flex flex-col gap-6 rounded-md bg-background p-4">
      <ChartHeading
        subheading="Batches created daily with the average number of transactions
        per batch"
      >
        Daily batches
      </ChartHeading>
      <ChartWrapper>
        <DailyCreatedBatchesWithAverage />
      </ChartWrapper>
    </div>
  )
}
