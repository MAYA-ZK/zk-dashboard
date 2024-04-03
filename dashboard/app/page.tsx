import { CurrencyToggle } from '@/app/_components/currency-toggle'
import { PeriodToggle } from '@/app/_components/period-toggle'
import { StatsTable } from '@/app/_components/stats/stats-table'
import { Hero } from '@/components/hero'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

// this is statically analyzed so it can not be computed
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600 // 1 hour in seconds

export default async function Page() {
  return (
    <main className="flex size-full grow flex-col items-center justify-center">
      <div className="flex w-full py-20">
        <Hero />
      </div>

      <div className="flex w-full flex-col gap-10 rounded-md bg-background px-9 py-7">
        <div className="flex flex-col justify-between gap-8 lg:flex-row">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-semibold uppercase">ZK-Rollups</h3>
            <h2 className="text-4xl font-semibold">Finality and Costs</h2>
            <p className="max-w-2xl text-sm font-light">
              This table presents key metrics on the efficiency and cost of
              batch operations for zero-knowledge (ZK) blockchains secured by
              Ethereum infrastructure, including average finality times and
              batch costs.
            </p>
          </div>
          <div className="flex min-w-96 flex-wrap items-center justify-end">
            <Suspense>
              <PeriodToggle />
              <span className="px-4">-</span>
              <CurrencyToggle />
            </Suspense>
          </div>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <StatsTable />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
