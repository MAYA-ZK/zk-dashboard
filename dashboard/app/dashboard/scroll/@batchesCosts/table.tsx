import { BatchTable } from '@/components/table/batch-table'
import {
  type GetBatchesCostsReturnType,
  getBatchesCosts,
  getBatchesCount,
} from '@/services/scroll/batches'

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
  /*
  {
    key: 'batchStatus',
    label: 'Batch status',
  },
  {
    key: 'batchLink',
    label: 'Link',
  },
  */
] satisfies Array<{
  key: keyof Omit<
    GetBatchesCostsReturnType[number],
    'batchLink' | 'batchStatus'
  >
  label: string
}>

interface ScrollBatchTableProps {
  page: number
}

export async function ScrollBatchTable({
  page,
  ...tableProps
}: ScrollBatchTableProps) {
  const batches = await getBatchesCosts(page, 10)
  const batchesCount = await getBatchesCount()
  const pages = Math.ceil(batchesCount / 10)

  return (
    <BatchTable
      page={page}
      pages={pages}
      batches={batches}
      searchParam={TABLE_PAGE_SEARCH_PARAM}
      columns={columns}
      linkLabel="Scroll scan"
      {...tableProps}
    />
  )
}
