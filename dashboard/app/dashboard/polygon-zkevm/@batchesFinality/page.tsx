import { SuspenseWithSkeleton } from '@/app/dashboard/_components/suspense-skeleton'
import { PolygonBatchesFinalityTable } from '@/app/dashboard/polygon-zkevm/@batchesFinality/table'
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
    <TableWrapper heading="Batches finality">
      <SuspenseWithSkeleton>
        <PolygonBatchesFinalityTable page={page} />
      </SuspenseWithSkeleton>
    </TableWrapper>
  )
}
