'use client'

import { AdditionalInfo } from '@/app/_components/additional-info'
import { InfoTooltip } from '@/app/_components/info-tooltip'
import { useCurrencyState } from '@/app/_utils/query-state'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatStringNumber } from '@/lib/formatters'
import { usePagination } from '@/lib/hooks/pagination'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, LoaderCircle } from 'lucide-react'

import type { Currency } from '@zk-dashboard/common/lib/currency'
import { CurrencyLogo } from '@zk-dashboard/dashboard/components/currency-logo'

import { BREAKDOWN_QUERY_KEY } from './constants'

type Batch = {
  batchNum: number
  batchLink: string
  batchStatus: string
} & Record<string, string | number | Record<string, string | number>>

export interface BatchTableInteractiveProps<TBatch extends Batch> {
  page: number
  pages: number
  columns: Array<{
    key: keyof TBatch
    label: string
    description?: string
    currency?: Currency
  }>
  searchParam: string
  linkLabel: string
  batches: Array<TBatch>
}

function getColumnValue<TBatch extends Batch>(
  batch: TBatch,
  key: keyof TBatch,
  currency: Currency
) {
  const value = batch[key]
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  if (typeof value === 'object' && value[currency]) {
    return formatStringNumber(
      value[currency].toString(),
      currency === 'usd' ? 2 : 8
    )
  }

  return null
}

export function BatchTable<TBatch extends Batch>({
  batches,
  page,
  pages,
  columns,
  searchParam,
  linkLabel,
  ...tableProps
}: BatchTableInteractiveProps<TBatch>) {
  const [currency] = useCurrencyState(BREAKDOWN_QUERY_KEY)
  const {
    isPending,
    page: optimisticPage,
    changePage,
  } = usePagination(page, searchParam)

  return (
    <div className="flex grow flex-col justify-between">
      <div className="relative">
        {isPending && (
          <div className="absolute z-10 flex size-full items-center justify-center bg-background/30">
            <LoaderCircle className="animate-spin text-primary" size={32} />
          </div>
        )}
        <Table
          className={cn('rounded-none shadow-none')}
          aria-label="Batches finality"
          {...tableProps}
        >
          <TableHeader>
            <TableRow isHeader>
              {columns.map((column) => {
                const showCurrency = /Cost$/.test(column.key as string)

                return (
                  <TableHead key={column.key.toString()}>
                    <div className="flex flex-none items-center gap-x-2">
                      {column.description && (
                        <InfoTooltip
                          contentClassName="text-wrap"
                          content={column.description}
                        />
                      )}

                      {showCurrency && <CurrencyLogo currency={currency} />}
                      <p className="line-clamp-2 min-w-40">{column.label}</p>
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => {
              return (
                <TableRow className="whitespace-nowrap" key={batch.batchNum}>
                  {columns.map((column) => {
                    if (column.key === 'batchNum') {
                      return (
                        <TableCell key={column.key.toString()}>
                          <div className="flex items-center gap-x-2">
                            <InfoTooltip
                              contentClassName="w-auto"
                              iconVariant="checkCircle"
                              content={
                                <AdditionalInfo
                                  data={[
                                    {
                                      label: 'Batch status',
                                      value: batch.batchStatus as string,
                                    },
                                  ]}
                                />
                              }
                            />
                            <a
                              target="_blank"
                              className="flex items-center justify-end gap-2 whitespace-nowrap underline"
                              href={batch.batchLink}
                            >
                              {batch.batchNum}
                            </a>
                          </div>
                        </TableCell>
                      )
                    }

                    const value = getColumnValue(batch, column.key, currency)

                    if (value) {
                      return (
                        <TableCell key={column.key.toString()}>
                          {value}
                        </TableCell>
                      )
                    }

                    return null
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Button
          size="sm"
          onClick={() => {
            if (optimisticPage === 1) {
              return
            }
            return changePage(optimisticPage - 1)
          }}
        >
          <ChevronLeftIcon width={16} height={16} />
        </Button>
        <p className="w-24 text-center">
          <span className="">{optimisticPage}</span> / {pages}
        </p>
        <Button
          size="sm"
          onClick={() => {
            if (optimisticPage === pages) {
              return
            }
            return changePage(optimisticPage + 1)
          }}
        >
          <ChevronRightIcon width={16} height={16} />
        </Button>
      </div>
    </div>
  )
}
