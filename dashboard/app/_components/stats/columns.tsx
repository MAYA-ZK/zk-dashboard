'use client'

import {
  AdditionalInfo,
  type AdditionalInfoData,
} from '@/app/_components/additional-info'
import { Breakdown, type BreakdownData } from '@/app/_components/breakdown'
import { InfoTooltip } from '@/app/_components/info-tooltip'
import { SortButton } from '@/app/_components/stats/sort-button'
import { CurrencyLogo } from '@/components/currency-logo'
import { compareTimeRanges } from '@/lib/time'
import type { ColumnDef, TableMeta } from '@tanstack/react-table'
import Image from 'next/image'
import Link from 'next/link'

import type { Currency } from '@zk-dashboard/common/lib/currency'

export type StatsRowData = {
  logo: string
  blockchainPath: string
  blockchain: string
  finality: {
    value: string
    additionalInfo?: Array<AdditionalInfoData>
  }
  finalityNormalized: string
  batchSize: string
  batchCost: {
    usd: string
    eth: string
    breakdown?: BreakdownData
  }
  batchCostNormalized: {
    usd: string
    eth: string
    breakdown?: BreakdownData
  }
}

const getCurrencyFromMeta = (
  meta: TableMeta<StatsRowData> | undefined
): Currency => {
  if (meta && 'currency' in meta) {
    return meta.currency as Currency
  }
  return 'usd'
}

export const columns: Array<ColumnDef<StatsRowData>> = [
  {
    accessorKey: 'blockchain',
    header: 'Rollup',
    cell: (cell) => {
      return (
        <Link
          className="hover:underline"
          href={cell.row.original.blockchainPath}
        >
          <div className="flex gap-2">
            <div className="flex size-5 items-center">
              <Image
                src={cell.row.original.logo}
                alt={`${cell.row.original.blockchain}-logo`}
                width={10}
                height={10}
                className="size-auto"
              />
            </div>
            {cell.row.getValue('blockchain')}
          </div>
        </Link>
      )
    },
  },
  {
    accessorKey: 'finality',
    sortingFn: (a, b) => {
      return compareTimeRanges(
        a.original.finality.value,
        b.original.finality.value
      )
    },
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-center gap-1.5">
            <InfoTooltip
              contentClassName="text-wrap"
              content="Average time from when a batch is created on L2 to its verification on L1 within the selected period."
            />
            <SortButton
              sortedState={column.getIsSorted()}
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            />
          </div>
          Proving / Finality Time
        </div>
      )
    },
    cell: (cell) => {
      const finality = cell.row.original.finality
      return (
        <>
          {finality.value}
          {finality.additionalInfo && (
            <InfoTooltip
              contentClassName="w-auto"
              content={
                <AdditionalInfo label="" data={finality.additionalInfo} />
              }
            />
          )}
        </>
      )
    },
  },
  {
    accessorKey: 'finalityNormalized',
    sortingFn: (a, b) => {
      return compareTimeRanges(
        a.original.finalityNormalized,
        b.original.finalityNormalized
      )
    },
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-center gap-1.5">
            <InfoTooltip
              contentClassName="text-wrap"
              content="Average finality time, adjusted for batches containing exactly 100 transactions, over the selected period."
            />
            <SortButton
              sortedState={column.getIsSorted()}
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            />
          </div>
          Proving / Finality Time (per 100 txs)
        </div>
      )
    },
  },
  {
    accessorKey: 'batchSize',
    sortingFn: (a, b) => {
      return Number(a.getValue('batchSize')) - Number(b.getValue('batchSize'))
    },
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-center gap-1.5">
            <InfoTooltip
              contentClassName="text-wrap"
              content="Average number of transactions per batch on L2, calculated over the selected date range."
            />
            <SortButton
              sortedState={column.getIsSorted()}
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            />
          </div>
          Txs per Proof
        </div>
      )
    },
  },
  {
    accessorKey: 'batchCost',
    sortingFn: (a, b) => {
      return Number(a.original.batchCost.usd) - Number(b.original.batchCost.usd)
    },
    header: ({ column, table }) => {
      const currency = getCurrencyFromMeta(table.options.meta)

      return (
        <div className="flex items-center gap-1.5">
          <CurrencyLogo currency={currency} />
          <div className="flex flex-col items-center gap-1.5">
            <InfoTooltip
              contentClassName="text-wrap"
              content="Average cost incurred for confirming L2 state updates on L1, calculated over the selected date range."
            />
            <SortButton
              sortedState={column.getIsSorted()}
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            />
          </div>
          On-Chain Finality Cost
        </div>
      )
    },
    cell: (context) => {
      const currency = getCurrencyFromMeta(context.table.options.meta)
      return (
        <div className="flex gap-x-1">
          {context.row.original.batchCost[currency]}{' '}
          {context.row.original.batchCost.breakdown && (
            <InfoTooltip
              contentClassName="w-auto"
              content={
                <Breakdown
                  currency={currency}
                  data={context.row.original.batchCost.breakdown}
                />
              }
            />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'batchCostNormalized',
    sortingFn: (a, b) => {
      return (
        Number(a.original.batchCostNormalized.usd) -
        Number(b.original.batchCostNormalized.usd)
      )
    },
    header: ({ column, table }) => {
      const currency = getCurrencyFromMeta(table.options.meta)
      return (
        <div className="flex items-center justify-end gap-1.5">
          <CurrencyLogo currency={currency} />
          <div className="flex flex-col items-center gap-1.5">
            <InfoTooltip
              contentClassName="text-wrap"
              content="Average L1 confirmation cost, adjusted for 1 transaction, over the selected period."
            />
            <SortButton
              sortedState={column.getIsSorted()}
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            />
          </div>
          On-Chain Finality Cost (per TX)
        </div>
      )
    },
    cell: (context) => {
      const currency = getCurrencyFromMeta(context.table.options.meta)
      return (
        <div className="flex justify-end gap-x-1">
          {context.row.original.batchCostNormalized[currency]}{' '}
          {context.row.original.batchCostNormalized.breakdown && (
            <InfoTooltip
              contentClassName="w-auto"
              content={
                <Breakdown
                  currency={currency}
                  data={context.row.original.batchCostNormalized.breakdown}
                />
              }
            />
          )}
        </div>
      )
    },
  },
]
