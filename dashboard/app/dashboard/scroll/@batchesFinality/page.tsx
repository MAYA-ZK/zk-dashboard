import { TABLE_PAGE_SEARCH_PARAM } from '@/app/dashboard/scroll/@batchesFinality/config'
import { ScrollBatchesFinalityTable } from '@/app/dashboard/scroll/@batchesFinality/table'
import {
  getBatchesFinality,
  getBatchesFinalityCount,
} from '@/services/scroll/batches'
import { format } from 'date-fns'

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
  const batches = await getBatchesFinality(page, 10)

  const batchesCount = await getBatchesFinalityCount()
  const pages = Math.ceil(batchesCount / 10)

  return (
    <ScrollBatchesFinalityTable
      batches={batches.map((batch) => {
        return {
          ...batch,
          batchCommitted: format(batch.batchCommitted, 'yyyy-MM-dd HH:mm:ss'),
          batchCreated: format(batch.batchCreated, 'yyyy-MM-dd HH:mm:ss'),
          batchVerified: format(batch.batchVerified, 'yyyy-MM-dd HH:mm:ss'),
        }
      })}
      page={page}
      pages={pages}
    />
  )
}
