import { SuspenseWithSkeleton } from '@/app/(dashboard)/dashboard/_components/suspense-skeleton'
import { TABLE_PAGE_SEARCH_PARAM } from '@/app/(dashboard)/dashboard/scroll/@batchesFinality/config'
import { ScrollBatchesFinalityTable } from '@/app/(dashboard)/dashboard/scroll/@batchesFinality/table'
import { TableWrapper } from '@/components/table/wrapper'

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
      subheading="The timeline from a batch is created to it being finalized."
      heading="Finality Time"
    >
      <SuspenseWithSkeleton>
        <ScrollBatchesFinalityTable page={page} />
      </SuspenseWithSkeleton>
    </TableWrapper>
  )
}
