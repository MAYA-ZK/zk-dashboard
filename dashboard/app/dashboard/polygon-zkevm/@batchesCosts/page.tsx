import { BatchesTable } from '@/app/dashboard/polygon-zkevm/@batchesCosts/table'
import {
  getBatchesCosts,
  getBatchesCount,
} from '@/services/polygon-zk-evm/batches'

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
  const batches = await getBatchesCosts(page, 10)

  const batchesCount = await getBatchesCount()
  const pages = Math.ceil(batchesCount / 10)

  return (
    <div className="flex w-full flex-col gap-8 rounded-md bg-content1 p-8">
      <h2 className="text-center">
        Batches that are created daily with the average number of transactions
        per batch
      </h2>
      <BatchesTable batches={batches} page={page} pages={pages} />
    </div>
  )
}
