import { SuspenseWithSkeleton } from '@/app/dashboard/_components/suspense-skeleton'
import { ChartHeading } from '@/components/chart/chart-heading'
import { ChartWrapper } from '@/components/chart/wrapper'

import { BatchesAvgCost } from './chart'

export default async function Page() {
  return (
    <div className="flex flex-col gap-6 rounded-md bg-background p-4">
      <ChartHeading>Batch cost</ChartHeading>
      <ChartWrapper>
        <SuspenseWithSkeleton>
          <BatchesAvgCost />
        </SuspenseWithSkeleton>
      </ChartWrapper>
    </div>
  )
}
