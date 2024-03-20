'use client'

import { usePagination } from '@/lib/hooks/pagination'
import {
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'
import { Button, Spinner, cn, getKeyValue } from '@nextui-org/react'
import type { TableProps } from '@nextui-org/table'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table'

export interface BatchTableInteractiveProps<
  TBatch extends { batch_num: number; batch_link: string },
> extends TableProps {
  page: number
  pages: number
  columns: Array<{ key: keyof TBatch; label: string }>
  searchParam: string
  linkLabel: string
  batches: Array<TBatch>
}

export function BatchTable<
  TBatch extends { batch_num: number; batch_link: string },
>({
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
    <div>
      <Table
        classNames={{
          wrapper: cn('rounded-none shadow-none'),
        }}
        aria-label="Batches finality"
        {...tableProps}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              className={cn({
                'text-right w-px': column.key === 'batch_link',
              })}
              key={column.key as string}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={batches}
          isLoading={isPending}
          loadingContent={
            <div className="flex size-full items-center justify-center bg-white opacity-80">
              <Spinner />
            </div>
          }
        >
          {(item) => (
            <TableRow
              className="overflow-hidden rounded-md hover:bg-primary/50"
              key={item.batch_num}
            >
              {(columnKey) => {
                if (columnKey === 'batch_link') {
                  return (
                    <TableCell className="rounded-r-md">
                      <a
                        target="_blank"
                        className="flex gap-2 whitespace-nowrap"
                        href={item.batch_link}
                      >
                        {linkLabel}
                        <ArrowTopRightOnSquareIcon className="size-5" />
                      </a>
                    </TableCell>
                  )
                }
                return (
                  <TableCell className="first:rounded-l-md">
                    {getKeyValue(item, columnKey)}
                  </TableCell>
                )
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
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
        <p className="w-24 text-center text-default-400">
          <span className="text-default-foreground">{optimisticPage}</span> /{' '}
          {pages}
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
