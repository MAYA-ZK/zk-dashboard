'use client'

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import { Pagination, Spinner, cn } from '@nextui-org/react'
import type { TableProps } from '@nextui-org/table'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'

import type { ScrollBatch } from '@zk-dashboard/common/database/schema'

interface BatchTableInteractiveProps extends TableProps {
  page: number
  pages: number
  batches: Array<
    ScrollBatch & {
      pricePerBatch: number
      pricePerTx: number
    }
  >
}

export function BatchesTable({
  batches,
  page,
  pages,
  ...tableProps
}: BatchTableInteractiveProps) {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [optimisticPage, updateOptimisticPage] = useOptimistic(
    page,
    (_, newPage: number) => newPage
  )

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams)
    if (newPage > 1) {
      params.set('page', newPage.toString())
    } else {
      params.delete('page')
    }
    startTransition(() => {
      updateOptimisticPage(newPage)
      replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      })
    })
  }

  return (
    <Table
      classNames={{
        wrapper: cn('rounded-none p-0 shadow-none', {
          'overflow-hidden': isPending,
        }),
      }}
      isHeaderSticky
      bottomContent={
        <div className="sticky bottom-0 flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            page={optimisticPage}
            total={pages}
            onChange={(newPage) => {
              handlePageChange(newPage)
            }}
          />
        </div>
      }
      aria-label="Batches"
      {...tableProps}
    >
      <TableHeader>
        <TableColumn>Index</TableColumn>
        <TableColumn maxWidth={20}>Transactions</TableColumn>
        <TableColumn maxWidth={20}>Batch cost</TableColumn>
        <TableColumn maxWidth={20}>Price per transaction</TableColumn>
        <TableColumn>Action</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isPending}
        loadingContent={
          <div className="flex size-full items-center justify-center bg-white opacity-80">
            <Spinner />
          </div>
        }
      >
        {batches.map((batch) => {
          return (
            <TableRow key={batch.hash}>
              <TableCell>{batch.number}</TableCell>
              <TableCell>{batch.total_tx_num}</TableCell>
              <TableCell>${batch.pricePerBatch.toFixed(2)}</TableCell>
              <TableCell>${batch.pricePerTx.toFixed(4)}</TableCell>
              <TableCell>
                <a
                  target="_blank"
                  className="flex gap-2 whitespace-nowrap"
                  href={'https://scroll.io/rollupscan/batch/' + batch.number}
                >
                  Scroll Scan
                  <ArrowTopRightOnSquareIcon className="size-5" />
                </a>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
