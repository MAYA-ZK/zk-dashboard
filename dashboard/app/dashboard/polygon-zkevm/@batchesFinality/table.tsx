import { BatchTable } from '@/components/table/batch-table'
import {
  type GetBatchesFinalityReturnType,
  getBatchesFinality,
  getBatchesFinalityCount,
} from '@/services/polygon-zk-evm/batches'
import { format } from 'date-fns'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

type Batch = {
  [K in keyof GetBatchesFinalityReturnType[number]]: GetBatchesFinalityReturnType[number][K] extends Date
    ? string
    : GetBatchesFinalityReturnType[number][K]
}

const columns = [
  {
    key: 'batchNum',
    label: 'Number',
  },
  {
    key: 'batchCreated',
    label: 'Created',
  },
  {
    key: 'batchCommitted',
    label: 'Committed',
  },
  {
    key: 'batchVerified',
    label: 'Verified',
  },
  /*
  {
    key: 'batchStatus',
    label: 'Status',
  },
  {
    key: 'batchLink',
    label: 'Link',
  },
  */
] satisfies Array<{
  key: keyof Omit<Batch, 'batchLink' | 'batchStatus'>
  label: string
}>

interface PolygonBatchesFinalityTableProps {
  page: number
}

export async function PolygonBatchesFinalityTable({
  page,
  ...tableProps
}: PolygonBatchesFinalityTableProps) {
  const batches = await getBatchesFinality(page, 10)

  const batchesCount = await getBatchesFinalityCount()
  const pages = Math.ceil(batchesCount / 10)

  return (
    <BatchTable
      page={page}
      pages={pages}
      batches={batches.map((batch) => {
        return {
          ...batch,
          batchCommitted: format(batch.batchCommitted, 'yyyy-MM-dd HH:mm:ss'),
          batchCreated: format(batch.batchCreated, 'yyyy-MM-dd HH:mm:ss'),
          batchVerified: format(batch.batchVerified, 'yyyy-MM-dd HH:mm:ss'),
        }
      })}
      searchParam={TABLE_PAGE_SEARCH_PARAM}
      columns={columns}
      linkLabel="Polygon zkEVM Scan"
      {...tableProps}
    />
  )
}
