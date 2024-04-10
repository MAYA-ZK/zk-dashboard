import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsBreakdownReturnType } from '@/services/scroll/batches'
import {
  getBatchesCostsBreakdown,
  getBatchesCostsBreakdownCount,
} from '@/services/scroll/batches'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

const columns = [
  { key: 'batchNum', label: 'Number' },
  { key: 'batchSize', label: ' Published txs' },
  {
    key: 'commitCost',
    label: 'Commit Cost',
    description:
      'The commit cost covers the L2 transaction data and block details are published on the Ethereum network to ensure data availability.',
  },
  {
    key: 'finalityCost',
    label: 'Finality Cost',
    description: 'The cost is based on the cost of proof for each batch.',
  },
] satisfies Array<{
  key: keyof GetBatchesCostsBreakdownReturnType[number]
  label: string
  description?: string
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
