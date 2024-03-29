'use client'

import {
  AdditionalInfo,
  type AdditionalInfoData,
} from '@/app/_components/additional-info'
import { Breakdown, type BreakdownData } from '@/app/_components/breakdown'
import { InfoTooltip } from '@/app/_components/info-tooltip'
import { SortButton } from '@/app/_components/stats/sort-button'
import { getCurrencySymbol } from '@/lib/formatters'
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
    header: 'Blockchain',
    cell: (cell) => {
      return (
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
          <Link
            className="hover:underline"
            href={cell.row.original.blockchainPath}
          >
            {cell.row.getValue('blockchain')}
          </Link>
        </div>
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
          Finality
          <SortButton
            sortedState={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
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
          Finality (Normalized)
          <SortButton
            sortedState={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
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
          Batch size
          <SortButton
            sortedState={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        </div>
      )
    },
  },
  {
    accessorKey: 'batchCost',
    sortingFn: (a, b) => {
      return Number(a.original.batchCost.usd) - Number(b.original.batchCost.usd)
    },
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-1.5">
          Finality Cost
          <SortButton
            sortedState={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        </div>
      )
    },
    cell: (context) => {
      const currency = getCurrencyFromMeta(context.table.options.meta)
      const currencySymbol = getCurrencySymbol(currency)
      return (
        <>
          <span>{currencySymbol}</span>{' '}
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
        </>
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
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-end gap-1.5">
          Finality Cost (Normalized)
          <SortButton
            sortedState={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        </div>
      )
    },
    cell: (context) => {
      const currency = getCurrencyFromMeta(context.table.options.meta)
      const currencySymbol = getCurrencySymbol(currency)
      return (
        <div className="flex justify-end">
          <span>{currencySymbol}</span>{' '}
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
