import { TABLE_PAGE_SEARCH_PARAM } from '@/app/(dashboard)/dashboard/zksync-era/@batchesCosts/config'
import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsBreakdownReturnType } from '@/services/zk-sync-era/batches'
import {
  getBatchesCostsBreakdown,
  getBatchesCostsBreakdownCount,
} from '@/services/zk-sync-era/batches'

const columns = [
  { key: 'batchNum', label: 'Number' },
  {
    key: 'batchSize',
    label: 'Published txs',
  },
  {
    key: 'commitCost',
    label: 'Commit Cost',
    description:
      'The commit cost covers the L2 transaction data and block details are published on the Ethereum network to ensure data availability.',
  },
  { key: 'proveCost', label: 'Prove Cost' },
  {
    key: 'executeCost',
    label: 'Execute Cost',
    description:
      'Calculated by dividing the total cost by the number of batches in the same state update transaction',
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

interface ZkSyncBatchTableProps {
  page: number
}

export async function ZkSyncBatchTable({
  page,

  ...tableProps
}: ZkSyncBatchTableProps) {
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
      linkLabel="zkSync Explorer"
      {...tableProps}
    />
  )
}
