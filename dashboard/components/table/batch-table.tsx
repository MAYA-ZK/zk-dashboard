'use client'

import { AdditionalInfo } from '@/app/_components/additional-info'
import { InfoTooltip } from '@/app/_components/info-tooltip'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePagination } from '@/lib/hooks/pagination'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, LoaderCircle } from 'lucide-react'

type Batch = { batchNum: number; batchLink: string } & Record<
  string | number,
  string | number
>

export interface BatchTableInteractiveProps<TBatch extends Batch> {
  page: number
  pages: number
  columns: Array<{ key: keyof TBatch; label: string }>
  searchParam: string
  linkLabel: string
  batches: Array<TBatch>
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
                return (
                  <TableHead key={column.key.toString()}>
                    {column.label}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => {
              return (
                <TableRow key={batch.batchNum}>
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
                    return (
                      <TableCell key={column.key.toString()}>
                        {batch[column.key]}
                      </TableCell>
                    )
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
