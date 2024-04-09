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
      <ChartHeading subheading="The daily number of transactions proven on the Ethereum network.">
        Daily Proven Transactions
      </ChartHeading>
      <ChartWrapper>
        <SuspenseWithSkeleton>
          <DailyFinalizedBatchesChart blockchain={blockchain} />
        </SuspenseWithSkeleton>
      </ChartWrapper>
    </div>
  )
}
