import { DailyFinalizedBatchesChart } from '@/app/dashboard/_components/charts/daily-finalized-batches/chart'
import { SuspenseWithSkeleton } from '@/app/dashboard/_components/suspense-skeleton'
import { ChartHeading } from '@/components/chart/chart-heading'
import { ChartWrapper } from '@/components/chart/wrapper'
import type { Blockchain } from '@/config/blockchain'

export async function DailyFinalizedBatchesPage({
  blockchain,
}: {
  blockchain: Blockchain
}) {
  return (
    <div className="flex flex-col gap-6 rounded-md bg-background p-4">
      <ChartHeading subheading="The daily transactions and finalized batches completed to update the state of the rollup (L2) on Ethereum (L1).">
        Daily batches finalized
      </ChartHeading>
      <ChartWrapper>
        <SuspenseWithSkeleton>
          <DailyFinalizedBatchesChart blockchain={blockchain} />
        </SuspenseWithSkeleton>
      </ChartWrapper>
    </div>
  )
}
