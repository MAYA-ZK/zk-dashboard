import { SuspenseWithSkeleton } from '@/app/dashboard/_components/suspense-skeleton'
import { ZkSyncBatchTable } from '@/app/dashboard/zksync-era/@batchesCosts/table'
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
    <TableWrapper heading="Batches created daily with the average number of transactions per batch">
      <SuspenseWithSkeleton>
        <ZkSyncBatchTable page={page} />
      </SuspenseWithSkeleton>
    </TableWrapper>
  )
}
