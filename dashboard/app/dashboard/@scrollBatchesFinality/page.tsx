import { TABLE_PAGE_SEARCH_PARAM } from '@/app/dashboard/@scrollBatchesFinality/config'
import { BatchesFinalityTable } from '@/app/dashboard/@scrollBatchesFinality/table'
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
    <div className="flex w-full flex-col gap-8 rounded-md bg-content1 p-8">
      <h2 className="text-center">Batches finality</h2>
      <BatchesFinalityTable
        batches={batches.map((batch) => {
          return {
            ...batch,
            batch_committed: format(
              batch.batch_committed,
              'yyyy-MM-dd HH:mm:ss'
            ),
            batch_created: format(batch.batch_created, 'yyyy-MM-dd HH:mm:ss'),
            batch_verified: format(batch.batch_verified, 'yyyy-MM-dd HH:mm:ss'),
          }
        })}
        page={page}
        pages={pages}
      />
    </div>
  )
}
