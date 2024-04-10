import { CurrencyToggle } from '@/app/_components/currency-toggle'
import { PeriodToggle } from '@/app/_components/period-toggle'
import { StatsTable } from '@/app/_components/stats/stats-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

// this is statically analyzed so it can not be computed
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600 // 1 hour in seconds

const INSIGHTS = {
  column1: [
    {
      title: 'Date Range',
      description:
        'The start date for each of the four selectable date ranges is defined as the day preceding the current calendar date. This approach ensures the inclusion of the most recent complete set of data for analysis.',
    },
    {
      title: 'Transactions (txs) per Proof',
      description:
        'This metric covers the average number of transactions in a single proof submitted for verification on the Ethereum network.',
    },
    {
      title: 'Proving / Finality Time',
      description:
        'The mean time from the instantiation of a submitted proof to its verification on the Ethereum network. For zkSync Era, the state update time can be found in the info box on the timestamp.',
    },
    {
      title: 'Proving / Finality Time (Per 100 txs)',
      description:
        'This metric follows the methodology of finality time calculation, with an adjustment for transaction volume. It is calculated by dividing the average finality time by the average number of transactions per proof and scaled by a factor of 100. This normalization process facilitates a standardized comparison of proving and finality times.',
    },
  ],
  column2: [
    {
      title: 'On-Chain Finality Cost',
      description:
        "This cost refers to the expenses incurred to verify proofs and update the rollup's state on the Ethereum network.",
    },
    {
      title: 'On-Chain Finality Cost (Per Tx)',
      description:
        'This metric presents the average cost incurred on the rollup to achieve finality for each transaction within a given batch. It is determined by dividing the on-chain cost associated with finalizing the batch by the number of transactions recorded within that batch.',
    },
  ],
}

export default async function Page() {
  return (
    <main className="flex size-full grow flex-col items-center justify-center">
      <div className="my-14 flex w-full flex-col gap-10 rounded-md bg-background px-9 py-7 pt-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-semibold uppercase">ZK-Rollups</h3>
            <h2 className="text-4xl font-semibold">Finality</h2>
            <p className="max-w-2xl text-sm font-light">
              This table presents the key metrics on the efficiency and cost for
              validity proofs of zero-knowledge rollups that submit state
              updates to the Ethereum network
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

      <div className="grid grid-cols-1 pt-12 text-sm md:grid-cols-2">
        <div className="p-5">
          {INSIGHTS.column1.map((insight, index) => (
            <p key={`key-${insight.title}-${index}`} className="pt-2">
              <span className="font-bold">{insight.title}: </span>
              {insight.description}
            </p>
          ))}
        </div>
        <div className="p-5">
          {INSIGHTS.column2.map((insight, index) => (
            <p key={`key-${insight.title}-${index}`} className="pt-2">
              <span className="font-bold">{insight.title}: </span>
              {insight.description}
            </p>
          ))}
        </div>
      </div>
    </main>
  )
}
