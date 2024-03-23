'use client'

import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesFinalityReturnType } from '@/services/polygon-zk-evm/batches'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

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

interface PolygonBatchesFinalityTableProps {
  page: number
  pages: number
  batches: Array<Batch>
}

export function PolygonBatchesFinalityTable({
  batches,
  page,
  pages,
  ...tableProps
}: PolygonBatchesFinalityTableProps) {
  return (
    <BatchTable
      page={page}
      pages={pages}
      title="Batches finality"
      batches={batches}
      searchParam={TABLE_PAGE_SEARCH_PARAM}
      columns={columns}
      linkLabel="Polygon zkEVM Scan"
      {...tableProps}
    />
  )
}
