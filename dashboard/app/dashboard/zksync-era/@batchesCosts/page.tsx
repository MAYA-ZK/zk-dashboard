import { ZkSyncBatchTable } from '@/app/dashboard/zksync-era/@batchesCosts/table'
import {
  getBatchesCosts,
  getBatchesCount,
} from '@/services/zk-sync-era/batches'

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

  return <ZkSyncBatchTable batches={batches} page={page} pages={pages} />
}
