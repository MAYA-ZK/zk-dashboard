'use client'

import type { FORCE_ANY } from '@/lib/types'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { cn } from '@nextui-org/react'
import { Tab, Tabs } from '@nextui-org/react'
import { Tooltip } from '@nextui-org/react'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/table'
import Image from 'next/image'
import type { Key } from 'react'
import { useEffect, useMemo, useState } from 'react'

export function StatsTable({
  columns,
  stats,
}: {
  columns: Array<{ key: string; label: string }>
  stats: FORCE_ANY
}) {
  const [period, setPeriod] = useState<string>('7_days')
  const [currency, setCurrency] = useState<string>('usd')

  const rows = useMemo(() => {
    const scrollStatsRow = stats.scroll[period]
    const zkSyncStatsRow = stats.zkSync[period]
    const polygonStatsRow = stats.polygon[period]

    return [
      {
        key: 0,
        blockchain: 'Scroll',
        img: './scroll-icon.svg',
        avgTotalCost:
          currency === 'usd'
            ? scrollStatsRow.avgTotalCostUsd
            : scrollStatsRow.avgTotalCostEth,
        avgTotalCostBy100:
          currency === 'usd'
            ? scrollStatsRow.avgTotalUsdCostBy100
            : scrollStatsRow.avgTotalEthCostBy100,

        ...scrollStatsRow,
      },
      {
        key: 1,
        blockchain: 'zkSync Era',
        img: './zkSync-icon.svg',
        avgTotalCost:
          currency === 'usd'
            ? zkSyncStatsRow.avgTotalCostUsd
            : zkSyncStatsRow.avgTotalCostEth,
        avgTotalCostBy100:
          currency === 'usd'
            ? zkSyncStatsRow.avgTotalUsdCostBy100
            : zkSyncStatsRow.avgTotalEthCostBy100,

        ...zkSyncStatsRow,
      },
      {
        key: 2,
        blockchain: 'Polygon zkEVM',
        img: './polygon-icon.svg',
        avgTotalCost:
          currency === 'usd'
            ? polygonStatsRow.avgTotalCostUsd
            : polygonStatsRow.avgTotalCostEth,
        avgTotalCostBy100:
          currency === 'usd'
            ? polygonStatsRow.avgTotalUsdCostBy100
            : polygonStatsRow.avgTotalEthCostBy100,

        ...polygonStatsRow,
      },
    ]
  }, [stats, period, currency])

  useEffect(() => {
    console.log('[StatsTable] statsRow', rows)
  }, [rows])

  return (
    <div className="h-unit-8xl w-full rounded-md bg-content1 p-8">
      <div className="flex w-full justify-between pb-12">
        <div>
          <p className="text-sm font-semibold">Table subheadline</p>
          <p className="text-4xl font-semibold">Table Headline</p>
        </div>

        <div className="flex flex-col items-end justify-center space-y-2">
          <Tabs
            aria-label="Time Options"
            variant="light"
            selectedKey={period}
            onSelectionChange={setPeriod as (key: Key) => void}
          >
            <Tab key="7_days" title="7 days" />
            <Tab key="30_days" title="30 days" />
            <Tab key="90_days" title="90 days" />
          </Tabs>

          <Tabs
            aria-label="Currency Options"
            variant="light"
            selectedKey={currency}
            onSelectionChange={setCurrency as (key: Key) => void}
          >
            <Tab key="usd" title="USD" />
            <Tab key="eth" title="ETH" />
          </Tabs>
        </div>
      </div>

      <Table
        classNames={{
          wrapper: cn('rounded-none shadow-none'),
        }}
        aria-label="Table description"
      >
        <TableHeader columns={columns}>
          {(column) => {
            if (column.key !== 'blockchain') {
              return (
                <TableColumn key={column.key}>
                  <Tooltip
                    className="bg-primary"
                    content={
                      <div className="max-w-48 p-2">
                        <div className="text-xs font-normal">
                          {column.description}
                        </div>
                      </div>
                    }
                  >
                    <div className="flex gap-x-2">
                      {column.label}
                      <InformationCircleIcon width={20} height={20} />
                    </div>
                  </Tooltip>
                </TableColumn>
              )
            }

            return <TableColumn key={column.key}>{column.label}</TableColumn>
          }}
        </TableHeader>
        <TableBody items={rows}>
          {(item) => (
            <TableRow
              className="overflow-hidden rounded-md hover:bg-primary/50"
              key={item.key}
            >
              {(columnKey) => {
                if (columnKey === 'blockchain') {
                  return (
                    <TableCell className="flex gap-x-2">
                      <Image
                        src={item.img}
                        width={20}
                        height={20}
                        alt={item.blockchain}
                      />
                      {getKeyValue(item, columnKey)}
                    </TableCell>
                  )
                } else if (columnKey === 'avgTotalCost') {
                  {
                    /* TODO: FIX: need to do this for 'avgTotalCostBy100' but for whatever reason
                     * including it in this if results in the `avgTotalCost` column being populated
                     * with `avgTotalCostBy100` also - :shrug: */
                  }
                  return (
                    <TableCell className="flex gap-x-2">
                      <Image
                        src={
                          currency === 'usd'
                            ? './usdc-logo.svg'
                            : './eth-logo.svg'
                        }
                        width={20}
                        height={20}
                        alt="currency"
                      />
                      {getKeyValue(item, columnKey)}
                    </TableCell>
                  )
                }

                return <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
