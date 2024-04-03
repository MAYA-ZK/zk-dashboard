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
      copy: 'The start date for each of the four selectable date ranges is defined as the day preceding the current calendar date. This approach ensures the inclusion of the most recent complete set of data for analysis.',
    },
    {
      title: 'Transactions (txs) per Proof',
      copy: 'This metric covers the aggregate number of transactions within batches that are sent for verification on the Ethereum blockchain.',
    },
    {
      title: 'Finality Time',
      copy: 'Finality time is calculated as the mean period from the instantiation of a transaction batch to its verification on Ethereum Layer-1 (L1). For specific rollups, such as within the zkSync Era, an additional parameter representing the execution time for the final state update is included to present the final state update.',
    },
    {
      title: 'Normalized Finality Time',
      copy: 'This metric follows the methodology of finality time calculation, with an adjustment for transaction volume. It is computed by dividing the average finality time by the number of transactions per proof and scaled by a factor of 100. This normalization process facilitates a standardized comparison of finality times.',
    },
  ],
  column2: [
    {
      title: 'Cost Calculation',
      copy: 'The cost associated with processing batches is influenced by the proof state, covering the average fees incurred for state updates on the rollup. Specifically, for zkSync Era and Polygon zkEVM, the verification and execution costs per batch are determined by the total number of batches included in the final state update.',
    },
    {
      title: 'Normalized Batch Cost',
      copy: 'This metric follows the batch cost calculation by normalizing against the transaction volume. The batch cost per proof is divided by the number of transactions included in the transactions per proof, and the quotient is then multiplied by 100. This gives the average cost to verify 100 transactions, offering a standardized metric for efficient rollup comparison.',
    },
    {
      title: 'Commit Cost Exclusion',
      copy: 'The cost for the commit stage is excluded from this table. The decision is based on that commit transaction costs are not pivotal for achieving finality, particularly in the context of validium-type rollups.',
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

      <div className="grid grid-cols-1 pt-12 text-sm md:grid-cols-2">
        <div className="p-5">
          {INSIGHTS.column1.map((insight, index) => (
            <p key={`key-${insight.title}-${index}`} className="pt-2">
              <span className="font-bold">{insight.title}: </span>
              {insight.copy}
            </p>
          ))}
        </div>
        <div className="p-5">
          {INSIGHTS.column2.map((insight, index) => (
            <p key={`key-${insight.title}-${index}`} className="pt-2">
              <span className="font-bold">{insight.title}: </span>
              {insight.copy}
            </p>
          ))}
        </div>
      </div>
    </main>
  )
}
