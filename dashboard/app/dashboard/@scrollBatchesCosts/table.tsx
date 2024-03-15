'use client'

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

import { TABLE_PAGE_SEARCH_PARAM } from '@/app/dashboard/@scrollBatchesCosts/config'
import { usePagination } from '@/lib/hooks/pagination'
import type { GetBatchesCostsReturnType } from '@/services/scroll/batches'
import { useSearchParams } from 'next/navigation'

interface BatchTableInteractiveProps extends TableProps {
  page: number
  pages: number
  batches: GetBatchesCostsReturnType
}

const columns = [
  {
    key: 'batch_num',
    label: 'Number',
  },
  {
    key: 'total_tx_count',
    label: 'Total transactions',
  },
  {
    key: 'est_commit_cost_usd',
    label: 'Commit cost',
  },
  {
    key: 'est_verification_cost_usd',
    label: 'Verification cost',
  },
  {
    key: 'est_batch_total_cost_usd',
    label: 'Batch cost',
  },
  {
    key: 'batch_status',
    label: 'Batch status',
  },
  {
    key: 'batch_link',
    label: 'Link',
  },
] satisfies Array<{
  key: keyof GetBatchesCostsReturnType[number]
  label: string
}>

export function BatchesTable({
  batches,
  page,
  pages,
  ...tableProps
}: BatchTableInteractiveProps) {
  const searchParams = useSearchParams()
  const {
    isPending,
    page: optimisticPage,
    changePage,
  } = usePagination(page, TABLE_PAGE_SEARCH_PARAM)

  console.log('bc', searchParams.toString())

  return (
    <div>
      <Table
        classNames={{
          wrapper: cn('rounded-none shadow-none'),
        }}
        aria-label="Batches that are created daily with the average number of transactions per batch"
        {...tableProps}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              className={cn({
                'text-right w-px': column.key === 'batch_link',
              })}
              key={column.key}
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
                        Scroll Scan
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
