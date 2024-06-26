import { SuspenseWithSkeleton } from '@/app/(dashboard)/dashboard/_components/suspense-skeleton'
import { ScrollBatchTable } from '@/app/(dashboard)/dashboard/scroll/@batchesCosts/table'
import { CurrencyToggle } from '@/app/_components/currency-toggle'
import { BREAKDOWN_QUERY_KEY } from '@/components/table/constants'
import { TableWrapper } from '@/components/table/wrapper'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

export default async function Page({
  searchParams,
}: {
  searchParams: {
    [TABLE_PAGE_SEARCH_PARAM]?: string
  }
}) {
  const page = searchParams[TABLE_PAGE_SEARCH_PARAM]
    ? parseInt(searchParams[TABLE_PAGE_SEARCH_PARAM])
    : 1

  return (
    <TableWrapper
      heading="Batch cost breakdown"
      subheading="Total breakdown of all costs from committing to finalizing a batch. The verification/execute cost is presented as the divided total cost and number of batches executed or verified in the same state transactions."
      rightControls={<CurrencyToggle queryKey={BREAKDOWN_QUERY_KEY} />}
    >
      <SuspenseWithSkeleton>
        <ScrollBatchTable page={page} />
      </SuspenseWithSkeleton>
    </TableWrapper>
  )
}
