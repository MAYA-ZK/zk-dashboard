import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsBreakdownReturnType } from '@/services/scroll/batches'
import {
  getBatchesCostsBreakdown,
  getBatchesCostsBreakdownCount,
} from '@/services/scroll/batches'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

const columns = [
  { key: 'blockchain', label: 'Rollup' },
  { key: 'batchNum', label: 'Number' },
  { key: 'batchSize', label: 'Size' },
  { key: 'commitCost', label: 'Commit Cost' },
  { key: 'finalityCost', label: 'Finality Cost' },
] satisfies Array<{
  key: keyof GetBatchesCostsBreakdownReturnType[number]
  label: string
}>

interface ScrollBatchTableProps {
  page: number
}

export async function ScrollBatchTable({
  page,
  ...tableProps
}: ScrollBatchTableProps) {
  const batches = await getBatchesCostsBreakdown(page, 10)
  const batchesCount = await getBatchesCostsBreakdownCount()
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
