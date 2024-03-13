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

import type { GetBatchesCostsReturnType } from '@/services/scroll/batches'
import { formatDate, formatToUsd } from '@/lib/formatters'

interface BatchTableInteractiveProps extends TableProps {
  page: number
  pages: number
  batches: GetBatchesCostsReturnType
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
    <div>
      <Table
        classNames={{
          wrapper: cn('rounded-none shadow-none', {
            'overflow-hidden': isPending,
          }),
        }}
        aria-label="Batches"
        {...tableProps}
      >
        <TableHeader>
          {/* batch_num, batch_verification, total_tx_count, est_commit_cost_usd, est_verification_cost_usd, est_batch_total_cost_usd, batch_status, and batch_link. */}
          <TableColumn>Number</TableColumn>
          <TableColumn>Verification</TableColumn>
          <TableColumn maxWidth={20}>Total transactions</TableColumn>
          <TableColumn maxWidth={20}>Estimated commit cost</TableColumn>
          <TableColumn maxWidth={20}>Estimated verification cost</TableColumn>
          <TableColumn maxWidth={20}>Estimated batch cost</TableColumn>
          <TableColumn maxWidth={20}>Batch status</TableColumn>
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
              <TableRow key={batch.batch_num}>
                <TableCell>{batch.batch_num}</TableCell>
                <TableCell>
                  {formatDate(batch.batch_verification, {
                    locales: 'en-US',
                  })}
                </TableCell>
                <TableCell>{batch.total_tx_count}</TableCell>
                <TableCell>
                  {formatToUsd(Number(batch.est_commit_cost_usd))}
                </TableCell>
                <TableCell>
                  {formatToUsd(Number(batch.est_verification_cost_usd))}
                </TableCell>
                <TableCell>
                  {formatToUsd(Number(batch.est_batch_total_cost_usd))}
                </TableCell>
                <TableCell>{batch.batch_status}</TableCell>
                <TableCell>
                  <a
                    target="_blank"
                    className="flex gap-2 whitespace-nowrap"
                    href={batch.batch_link}
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
      <div className="flex justify-center ">
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
    </div>
  )
}
