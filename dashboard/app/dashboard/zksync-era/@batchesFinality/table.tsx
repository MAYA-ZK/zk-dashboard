import { BLOCKCHAIN_TIMESTAMP_FORMAT } from '@/app/dashboard/_utils/constants'
import { TABLE_PAGE_SEARCH_PARAM } from '@/app/dashboard/zksync-era/@batchesFinality/config'
import { BatchTable } from '@/components/table/batch-table'
import {
  type GetFinalityTimeReturnType,
  getFinalityTime,
  getFinalityTimeCount,
} from '@/services/zk-sync-era/batches'
import { format } from 'date-fns'

const columns = [
  { key: 'blockchain', label: 'Blockchain' },
  { key: 'batchNum', label: 'Number' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'committedAt', label: 'Committed At' },
  { key: 'provenAt', label: 'Proven At' },
  { key: 'executedAt', label: 'Executed At' },
  { key: 'createdToExecutedDuration', label: 'Created to Executed Duration' },
  { key: 'createdToProvenDuration', label: 'Created to Proven Duration' },
] satisfies Array<{
  key: keyof GetFinalityTimeReturnType[number]
  label: string
}>

interface ZkSyncBatchesFinalityTableProps {
  page: number
}

export async function ZkSyncBatchesFinalityTable({
  page,
  ...tableProps
}: ZkSyncBatchesFinalityTableProps) {
  const batches = await getFinalityTime(page, 10)
  const batchesCount = await getFinalityTimeCount()
  const pages = Math.ceil(batchesCount / 10)

  return (
    <BatchTable
      page={page}
      pages={pages}
      batches={batches.map((batch) => {
        return {
          ...batch,
          createdAt: format(batch.createdAt, BLOCKCHAIN_TIMESTAMP_FORMAT),
          committedAt: format(batch.committedAt, BLOCKCHAIN_TIMESTAMP_FORMAT),
          provenAt: format(batch.provenAt, BLOCKCHAIN_TIMESTAMP_FORMAT),
          executedAt: format(batch.executedAt, BLOCKCHAIN_TIMESTAMP_FORMAT),
        }
      })}
      searchParam={TABLE_PAGE_SEARCH_PARAM}
      columns={columns}
      linkLabel="zkSync Explorer"
      {...tableProps}
    />
  )
}
