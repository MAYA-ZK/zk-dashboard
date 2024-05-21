import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsBreakdownReturnType } from '@/services/scroll/batches'
import {
  getBatchesCostsBreakdown,
  getBatchesCostsBreakdownCount,
} from '@/services/scroll/batches'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

const columns = [
  {
    key: 'batchNum',
    label: 'Number',
    description:
      'The sequential number given to the batch processed on the L1 network.',
  },
  {
    key: 'batchSize',
    label: ' Published txs',
    description: 'The count of L2 transactions inside the batch.',
  },
  {
    key: 'commitCost',
    label: 'Commit Cost',
    description:
      'The commit cost covers the L2 transaction data and block details are published on the Ethereum network to ensure data availability.',
  },
  {
    key: 'finalityCost',
    label: 'Finality Cost',
    description:
      'The final cost to update the L2 transaction data on L1 is based on the cost of proof.',
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
