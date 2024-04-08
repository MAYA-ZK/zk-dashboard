import { TABLE_PAGE_SEARCH_PARAM } from '@/app/dashboard/zksync-era/@batchesCosts/config'
import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsBreakdownReturnType } from '@/services/zk-sync-era/batches'
import {
  getBatchesCostsBreakdown,
  getBatchesCostsBreakdownCount,
} from '@/services/zk-sync-era/batches'

const columns = [
  { key: 'blockchain', label: 'Rollup' },
  { key: 'batchNum', label: 'Number' },
  { key: 'batchSize', label: 'Size' },
  { key: 'commitCost', label: 'Commit Cost' },
  { key: 'proveCost', label: 'Prove Cost' },
  { key: 'executeCost', label: 'Execute Cost' },
  { key: 'finalityCost', label: 'Finality Cost' },
] satisfies Array<{
  key: keyof GetBatchesCostsBreakdownReturnType[number]
  label: string
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
