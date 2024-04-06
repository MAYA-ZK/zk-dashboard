import { BLOCKCHAIN_TIMESTAMP_FORMAT } from '@/app/dashboard/_utils/constants'
import { BatchTable } from '@/components/table/batch-table'
import type { GetFinalityTimeReturnType } from '@/services/polygon-zk-evm/batches'
import {
  getFinalityTime,
  getFinalityTimeCount,
} from '@/services/polygon-zk-evm/batches'
import { format } from 'date-fns'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

const columns = [
  { key: 'blockchain', label: 'Blockchain' },
  { key: 'batchNum', label: 'Number' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'sequencedAt', label: 'Sequenced At' },
  { key: 'verifiedAt', label: 'Verified At' },
  { key: 'createdToVerifiedDuration', label: 'Created to Verified Duration' },
] satisfies Array<{
  key: keyof GetFinalityTimeReturnType[number]
  label: string
}>

interface PolygonBatchesFinalityTableProps {
  page: number
}

export async function PolygonBatchesFinalityTable({
  page,
  ...tableProps
}: PolygonBatchesFinalityTableProps) {
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
          createdAt: format(
            new Date(batch.createdAt),
            BLOCKCHAIN_TIMESTAMP_FORMAT
          ),
          sequencedAt: format(
            new Date(batch.sequencedAt),
            BLOCKCHAIN_TIMESTAMP_FORMAT
          ),
          verifiedAt: format(
            new Date(batch.verifiedAt),
            BLOCKCHAIN_TIMESTAMP_FORMAT
          ),
        }
      })}
      searchParam={TABLE_PAGE_SEARCH_PARAM}
      columns={columns}
      linkLabel="Polygon zkEVM Scan"
      {...tableProps}
    />
  )
}
