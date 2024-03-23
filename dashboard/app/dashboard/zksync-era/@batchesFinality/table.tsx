'use client'

import { TABLE_PAGE_SEARCH_PARAM } from '@/app/dashboard/zksync-era/@batchesFinality/config'
import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesFinalityReturnType } from '@/services/scroll/batches'

type Batch = {
  [K in keyof GetBatchesFinalityReturnType[number]]: GetBatchesFinalityReturnType[number][K] extends Date
    ? string
    : GetBatchesFinalityReturnType[number][K]
}

const columns = [
  {
    key: 'batchNum',
    label: 'Number',
  },
  {
    key: 'batchCreated',
    label: 'Created',
  },
  {
    key: 'batchCommitted',
    label: 'Committed',
  },
  {
    key: 'batchVerified',
    label: 'Verified',
  },
  {
    key: 'batchStatus',
    label: 'Status',
  },
  {
    key: 'batchLink',
    label: 'Link',
  },
] satisfies Array<{
  key: keyof Batch
  label: string
}>

interface ZkSyncBatchesFinalityTableProps {
  page: number
  pages: number
  batches: Array<Batch>
}

export function ZkSyncBatchesFinalityTable({
  batches,
  page,
  pages,
  ...tableProps
}: ZkSyncBatchesFinalityTableProps) {
  return (
    <BatchTable
      title="Batches finality"
      page={page}
      pages={pages}
      batches={batches}
      searchParam={TABLE_PAGE_SEARCH_PARAM}
      columns={columns}
      linkLabel="zkSync Explorer"
      {...tableProps}
    />
  )
}
