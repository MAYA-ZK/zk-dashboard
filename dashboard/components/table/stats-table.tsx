'use client'

import type { FORCE_ANY } from '@/lib/types'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { Tab, Tabs, Tooltip, cn } from '@nextui-org/react'
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
import { useMemo, useState } from 'react'

export function StatsTable({
  columns,
  stats,
}: {
  columns: Array<{ key: string; label: string; description?: string }>
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
        avgFinality: scrollStatsRow.avgFinality,
        avgDurationBy100: scrollStatsRow.avgDurationBy100,
        avgTxsInsideBatch: Number(scrollStatsRow.avgTxsInsideBatch).toFixed(3),
        avgTotalCost: {
          cost:
            currency === 'usd'
              ? Number(scrollStatsRow.avgTotalCostUsd).toFixed(3)
              : Number(scrollStatsRow.avgTotalCostEth).toString(3),
          breakdown: {
            description: 'Average cost breakdown:',
            commitCost:
              currency === 'usd'
                ? Number(scrollStatsRow.avgCommitCostUsd).toFixed(3)
                : Number(scrollStatsRow.avgCommitCostEth).toFixed(3),
            verifyCost:
              currency === 'usd'
                ? Number(scrollStatsRow.avgVerifyCostUsd).toFixed(3)
                : Number(scrollStatsRow.avgVerifyCostEth).toFixed(3),
          },
        },
        avgTotalCostBy100: {
          cost:
            currency === 'usd'
              ? Number(scrollStatsRow.avgTotalUsdCostBy100).toFixed(3)
              : Number(scrollStatsRow.avgTotalEthCostBy100).toFixed(3),
          breakdown: {
            description: 'Average cost breakdown:',
            txCost:
              currency === 'usd'
                ? Number(scrollStatsRow.avgTxsCostUsd).toFixed(6)
                : Number(scrollStatsRow.avgTxsCostEth).toFixed(6),
          },
        },
      },
      {
        key: 1,
        blockchain: 'zkSync Era',
        img: './zkSync-icon.svg',
        avgFinality: zkSyncStatsRow.avgFinality,
        avgDurationBy100: zkSyncStatsRow.avgDurationBy100,
        avgTxsInsideBatch: Number(zkSyncStatsRow.avgTxsInsideBatch).toFixed(3),
        avgTotalCost: {
          cost:
            currency === 'usd'
              ? Number(zkSyncStatsRow.avgTotalCostUsd).toFixed(3)
              : Number(zkSyncStatsRow.avgTotalCostEth).toString(3),
          breakdown: {
            description: 'Average cost breakdown:',
            commitCost:
              currency === 'usd'
                ? Number(zkSyncStatsRow.avgCommitCostUsd).toFixed(3)
                : Number(zkSyncStatsRow.avgCommitCostEth).toFixed(3),
            verifyCost:
              currency === 'usd'
                ? Number(zkSyncStatsRow.avgVerifyCostUsd).toFixed(3)
                : Number(zkSyncStatsRow.avgVerifyCostEth).toFixed(3),
          },
        },
        avgTotalCostBy100: {
          cost:
            currency === 'usd'
              ? Number(zkSyncStatsRow.avgTotalUsdCostBy100).toFixed(3)
              : Number(zkSyncStatsRow.avgTotalEthCostBy100).toFixed(3),
          breakdown: {
            description: 'Average cost breakdown:',
            txCost:
              currency === 'usd'
                ? Number(zkSyncStatsRow.avgTxsCostUsd).toFixed(6)
                : Number(zkSyncStatsRow.avgTxsCostEth).toFixed(6),
          },
        },
      },
      {
        key: 2,
        blockchain: 'Polygon zkEVM',
        img: './polygon-icon.svg',
        avgFinality: polygonStatsRow.avgFinality,
        avgDurationBy100: polygonStatsRow.avgDurationBy100,
        avgTxsInsideBatch: Number(polygonStatsRow.avgTxsInsideBatch).toFixed(3),
        avgTotalCost: {
          cost:
            currency === 'usd'
              ? Number(polygonStatsRow.avgTotalCostUsd).toFixed(3)
              : Number(polygonStatsRow.avgTotalCostEth).toString(3),
          breakdown: {
            description: 'Average cost breakdown:',
            commitCost:
              currency === 'usd'
                ? Number(polygonStatsRow.avgCommitCostUsd).toFixed(3)
                : Number(polygonStatsRow.avgCommitCostEth).toFixed(3),
            verifyCost:
              currency === 'usd'
                ? Number(polygonStatsRow.avgVerifyCostUsd).toFixed(3)
                : Number(polygonStatsRow.avgVerifyCostEth).toFixed(3),
          },
        },
        avgTotalCostBy100: {
          cost:
            currency === 'usd'
              ? Number(polygonStatsRow.avgTotalUsdCostBy100).toFixed(3)
              : Number(polygonStatsRow.avgTotalEthCostBy100).toFixed(3),
          breakdown: {
            description: 'Average cost breakdown:',
            txCost:
              currency === 'usd'
                ? Number(polygonStatsRow.avgTxsCostUsd).toFixed(6)
                : Number(polygonStatsRow.avgTxsCostEth).toFixed(6),
          },
        },
      },
    ]
  }, [stats, period, currency])

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
                    <TableCell>
                      <div className="flex gap-x-2">
                        <Image
                          src={item.img}
                          width={20}
                          height={20}
                          alt={item.blockchain}
                        />
                        {getKeyValue(item, columnKey)}
                      </div>
                    </TableCell>
                  )
                } else if (
                  columnKey === 'avgTotalCost' ||
                  columnKey === 'avgTotalCostBy100'
                ) {
                  const columnValue = getKeyValue(item, columnKey)
                  const breakdown = columnValue.breakdown

                  return (
                    <TableCell>
                      <Tooltip
                        className="bg-primary"
                        content={
                          <div className="max-w-48 p-2">
                            <div className="pb-4 text-medium font-normal">
                              {breakdown.description}
                            </div>
                            {columnKey === 'avgTotalCost' ? (
                              <>
                                <div className="pb-1 text-xs font-normal">
                                  Commit Cost: {breakdown.commitCost}
                                </div>
                                <div className="pb-2 text-xs font-normal">
                                  Verify Cost: {breakdown.verifyCost}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="pb-1 text-xs font-normal">
                                  Proving cost per tx: {breakdown.txCost}
                                </div>
                              </>
                            )}
                          </div>
                        }
                      >
                        <div className="flex gap-x-2 rounded-lg bg-background p-2">
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
                          {Number(columnValue.cost).toFixed(3)}
                        </div>
                      </Tooltip>
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
