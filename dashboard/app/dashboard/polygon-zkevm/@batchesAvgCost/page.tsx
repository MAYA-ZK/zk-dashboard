import { ChartHeading } from '@/components/chart/chart-heading'
import { ChartWrapper } from '@/components/chart/wrapper'

import { BatchesAvgCost } from './chart'

export default async function Page() {
  return (
    <div className="flex flex-col gap-6 rounded-md bg-background p-4">
      <ChartHeading>Batch cost</ChartHeading>
      <ChartWrapper>
        <BatchesAvgCost />
      </ChartWrapper>
    </div>
  )
}
