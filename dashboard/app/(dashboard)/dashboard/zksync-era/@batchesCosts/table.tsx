import { TABLE_PAGE_SEARCH_PARAM } from '@/app/(dashboard)/dashboard/zksync-era/@batchesCosts/config'
import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsBreakdownReturnType } from '@/services/zk-sync-era/batches'
import {
  getBatchesCostsBreakdown,
  getBatchesCostsBreakdownCount,
} from '@/services/zk-sync-era/batches'

const columns = [
  {
    key: 'batchNum',
    label: 'Number',
    description:
      'The sequential number given to the batch processed on the L1 network.',
  },
  {
    key: 'batchSize',
    label: 'Published txs',
    description: 'The count of L2 transactions inside the batch.',
  },
  {
    key: 'commitCost',
    label: 'Commit Cost',
    description:
      'The commit cost covers the L2 transaction data and block details are published on the L1 network to ensure data availability.',
  },
  {
    key: 'proveCost',
    label: 'Prove Cost',
    description: 'Cost of proof on the L1 network.',
  },
  {
    key: 'executeCost',
    label: 'Execute Cost',
    description:
      'Multiple batches can be included in a single state update transaction submitted to the L1 network, allowing the submission cost to be distributed across the batches included in the proof.',
  },
  {
    key: 'finalityCost',
    label: 'Finality Cost',
    description:
      'The final cost to update the L2 transaction data on L1 is based on the cost of proof and distributed execution cost.',
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
