import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsBreakdownReturnType } from '@/services/polygon-zk-evm/batches'
import {
  getBatchesCostsBreakdown,
  getBatchesCostsBreakdownCount,
} from '@/services/polygon-zk-evm/batches'

import type { Currency } from '@zk-dashboard/common/lib/currency'

import { TABLE_PAGE_SEARCH_PARAM } from './config'

const columns = [
  { key: 'blockchain', label: 'Rollup' },
  { key: 'batchNum', label: 'Number' },
  { key: 'batchSize', label: 'Size' },
  { key: 'sequenceCost', label: 'Sequence Cost' },
  { key: 'verificationCost', label: 'Verification Cost' },
  { key: 'finalityCost', label: 'Finality Cost' },
  { key: 'dividedVerificationCost', label: 'Divided Verification Cost' },
] satisfies Array<{
  key: keyof GetBatchesCostsBreakdownReturnType[number]
  label: string
  currency?: Currency
}>

interface PolygonBatchTableProps {
  page: number
}

export async function PolygonBatchTable({
  page,
  ...tableProps
}: PolygonBatchTableProps) {
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
      linkLabel="Polygon zkEVM Scan"
      {...tableProps}
    />
  )
}
