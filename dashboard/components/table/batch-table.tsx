'use client'

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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLink,
  LoaderCircle,
} from 'lucide-react'

type Batch = { batchNum: number; batchLink: string } & Record<
  string | number,
  string | number
>

export interface BatchTableInteractiveProps<TBatch extends Batch> {
  title: string
  page: number
  pages: number
  columns: Array<{ key: keyof TBatch; label: string }>
  searchParam: string
  linkLabel: string
  batches: Array<TBatch>
}

export function BatchTable<TBatch extends Batch>({
  title,
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
    <div className="flex w-full flex-col gap-4 rounded-md bg-background px-5 py-3">
      <h2 className="p-2 text-2xl font-semibold">{title}</h2>
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
              {columns.map((column, index) => {
                return (
                  <TableHead
                    key={column.key.toString()}
                    className={cn({
                      'text-end w-1': index === columns.length - 1,
                    })}
                  >
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
                    if (column.key === 'batchLink') {
                      return (
                        <TableCell key={column.key.toString()}>
                          <a
                            target="_blank"
                            className="flex items-center justify-end gap-2 whitespace-nowrap"
                            href={batch.batchLink}
                          >
                            {linkLabel}
                            <ExternalLink size={16} />
                          </a>
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
