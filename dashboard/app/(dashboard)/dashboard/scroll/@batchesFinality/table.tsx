import { BLOCKCHAIN_TIMESTAMP_FORMAT } from '@/app/(dashboard)/dashboard/_utils/constants'
import { TABLE_PAGE_SEARCH_PARAM } from '@/app/(dashboard)/dashboard/scroll/@batchesFinality/config'
import { BatchTable } from '@/components/table/batch-table'
import type { GetFinalityTimeReturnType } from '@/services/scroll/batches'
import {
  getFinalityTime,
  getFinalityTimeCount,
} from '@/services/scroll/batches'
import { format } from 'date-fns'

const columns = [
  {
    key: 'batchNum',
    label: 'Number',
    description:
      'The sequential number given to the batch processed on the L1 network.',
  },
  {
    key: 'createdAt',
    label: 'Created At',
    description:
      'The timestamp when the criterion for proposing a new batch was met.',
  },
  {
    key: 'committedAt',
    label: 'Committed At',
    description:
      'The timestamp when the rollup submitted the L2 transaction data to the L1 network to ensure data availability, which marks the data as part of the L1 state for transparency and security.',
  },
  {
    key: 'finalizedAt',
    label: 'Finalized At',
    description:
      'The timestamp when the L2 transaction data got confirmed on the L1 network, withdrawal transactions from the rollup are now executable on L1 following successful verification.',
  },
  {
    key: 'createdToFinalizedDuration',
    label: 'Lead Time: Created to Finalized',
    description:
      'The duration from when the L2 transaction data got batched to it was proven.',
  },
] satisfies Array<{
  key: keyof GetFinalityTimeReturnType[number]
  label: string
  description?: string
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
