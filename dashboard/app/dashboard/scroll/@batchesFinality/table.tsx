import { BLOCKCHAIN_TIMESTAMP_FORMAT } from '@/app/dashboard/_utils/constants'
import { TABLE_PAGE_SEARCH_PARAM } from '@/app/dashboard/scroll/@batchesFinality/config'
import { BatchTable } from '@/components/table/batch-table'
import type { GetFinalityTimeReturnType } from '@/services/scroll/batches'
import {
  getFinalityTime,
  getFinalityTimeCount,
} from '@/services/scroll/batches'
import { format } from 'date-fns'

const columns = [
  { key: 'blockchain', label: 'Blockchain' },
  { key: 'batchNum', label: 'Number' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'committedAt', label: 'Committed At' },
  { key: 'finalizedAt', label: 'Finalized At' },
  { key: 'createdToFinalizedDuration', label: 'Created to Finalized Duration' },
] satisfies Array<{
  key: keyof GetFinalityTimeReturnType[number]
  label: string
}>

interface ScrollBatchesFinalityTableProps {
  page: number
}

export async function ScrollBatchesFinalityTable({
  page,
  ...tableProps
}: ScrollBatchesFinalityTableProps) {
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
          finalizedAt: format(batch.finalizedAt, BLOCKCHAIN_TIMESTAMP_FORMAT),
        }
      })}
      searchParam={TABLE_PAGE_SEARCH_PARAM}
      columns={columns}
      linkLabel="Scroll scan"
      {...tableProps}
    />
  )
}
