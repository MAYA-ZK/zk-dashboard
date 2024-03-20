'use client'

import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsReturnType } from '@/services/polygon-zk-evm/batches'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

const columns = [
  {
    key: 'batch_num',
    label: 'Number',
  },
  {
    key: 'total_tx_count',
    label: 'Total transactions',
  },
  {
    key: 'est_commit_cost_usd',
    label: 'Commit cost',
  },
  {
    key: 'est_verification_cost_usd',
    label: 'Verification cost',
  },
  {
    key: 'est_batch_total_cost_usd',
    label: 'Batch cost',
  },
  {
    key: 'batch_status',
    label: 'Batch status',
  },
  {
    key: 'batch_link',
    label: 'Link',
  },
] satisfies Array<{
  key: keyof GetBatchesCostsReturnType[number]
  label: string
}>

interface PolygonBatchTableProps {
  page: number
  pages: number
  batches: GetBatchesCostsReturnType
}

export function PolygonBatchTable({
  batches,
  page,
  pages,
  ...tableProps
}: PolygonBatchTableProps) {
  return (
    <BatchTable
      page={page}
      pages={pages}
      batches={batches}
      searchParam={TABLE_PAGE_SEARCH_PARAM}
      columns={columns}
      linkLabel="Polygon zkEVM Scan"
      {...tableProps}
    />
  )
}
