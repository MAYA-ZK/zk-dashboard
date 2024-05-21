import { BatchTable } from '@/components/table/batch-table'
import type { GetBatchesCostsBreakdownReturnType } from '@/services/polygon-zk-evm/batches'
import {
  getBatchesCostsBreakdown,
  getBatchesCostsBreakdownCount,
} from '@/services/polygon-zk-evm/batches'

import type { Currency } from '@zk-dashboard/common/lib/currency'

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
    label: 'Published txs',
    description: 'The count of L2 transactions inside the batch.',
  },
  {
    key: 'sequenceCost',
    label: 'Sequence Cost',
    description:
      'The sequencer cost covers the L2 transaction data and block details are published on the Ethereum network to ensure data availability.',
  },
  {
    key: 'verificationCost',
    label: 'Verification Cost',
    description:
      'Calculated by dividing the total cost by the number of batches in the same state update transaction.',
  },
  {
    key: 'finalityCost',
    label: 'Finality Cost',
    description: 'The cost is based on the cost of proof for each batch',
  },
  {
    key: 'dividedVerificationCost',
    label: 'Divided Verification Cost',
    description:
      'Multiple batches can be included in a single state update transaction submitted to the L1 network, allowing the submission cost to be distributed across the batches included in the proof.',
  },
] satisfies Array<{
  key: keyof GetBatchesCostsBreakdownReturnType[number]
  label: string
  description?: string
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
