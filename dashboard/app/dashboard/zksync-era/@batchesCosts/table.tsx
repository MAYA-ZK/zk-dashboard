'use client'

import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsReturnType } from '@/services/zk-sync-era/batches'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

const columns = [
  {
    key: 'batchNum',
    label: 'Number',
  },
  {
    key: 'totalTxCount',
    label: 'Total transactions',
  },
  {
    key: 'estCommitCostUsd',
    label: 'Commit cost',
  },
  {
    key: 'estVerificationCostUsd',
    label: 'Verification cost',
  },
  {
    key: 'estBatchTotalCostUsd',
    label: 'Batch cost',
  },
  {
    key: 'batchStatus',
    label: 'Batch status',
  },
  {
    key: 'batchLink',
    label: 'Link',
  },
] satisfies Array<{
  key: keyof GetBatchesCostsReturnType[number]
  label: string
}>

interface ZkSyncBatchTableProps {
  page: number
  pages: number
  batches: GetBatchesCostsReturnType
}

export function ZkSyncBatchTable({
  batches,
  page,
  pages,
  ...tableProps
}: ZkSyncBatchTableProps) {
  return (
    <BatchTable
      title="Batches created daily with the average number of transactions per batch"
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
