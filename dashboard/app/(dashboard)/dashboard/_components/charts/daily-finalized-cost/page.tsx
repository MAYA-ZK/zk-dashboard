import { DailyFinalizedCostChart } from '@/app/(dashboard)/dashboard/_components/charts/daily-finalized-cost/chart'
import { CURRENCY_QUERY_KEY } from '@/app/(dashboard)/dashboard/_components/charts/daily-finalized-cost/constants'
import { SuspenseWithSkeleton } from '@/app/(dashboard)/dashboard/_components/suspense-skeleton'
import { CurrencyToggle } from '@/app/_components/currency-toggle'
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
      <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
        <ChartHeading subheading="The total cost spent on proving the state of the rollup on the Ethereum network.">
          Daily Finality Cost
        </ChartHeading>
        <Suspense>
          <div className="pt-3">
            <CurrencyToggle queryKey={CURRENCY_QUERY_KEY} />
          </div>
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
