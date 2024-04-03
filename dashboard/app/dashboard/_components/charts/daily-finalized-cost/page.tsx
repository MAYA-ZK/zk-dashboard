import { CurrencyToggle } from '@/app/_components/currency-toggle'
import { DailyFinalizedCostChart } from '@/app/dashboard/_components/charts/daily-finalized-cost/cahrt'
import { currencyQueryKey } from '@/app/dashboard/_components/charts/daily-finalized-cost/constants'
import { SuspenseWithSkeleton } from '@/app/dashboard/_components/suspense-skeleton'
import { ChartHeading } from '@/components/chart/chart-heading'
import { ChartWrapper } from '@/components/chart/wrapper'
import type { Blockchain } from '@/config/blockchain'
import { Suspense } from 'react'

export async function DailyFinalizedCostPage({
  blockchain,
}: {
  blockchain: Blockchain
}) {
  return (
    <div className="flex flex-col gap-6 rounded-md bg-background p-4">
      <div className="flex items-center justify-between">
        <ChartHeading>Daily cost to finalize batches</ChartHeading>
        <Suspense>
          <CurrencyToggle queryKey={currencyQueryKey} />
        </Suspense>
      </div>
      <ChartWrapper>
        <SuspenseWithSkeleton>
          <DailyFinalizedCostChart blockchain={blockchain} />
        </SuspenseWithSkeleton>
      </ChartWrapper>
    </div>
  )
}
