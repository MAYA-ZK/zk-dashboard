'use client'

import {
  AdditionalInfo,
  type AdditionalInfoData,
} from '@/app/_components/additional-info'
import { Breakdown, type BreakdownData } from '@/app/_components/breakdown'
import { InfoTooltip } from '@/app/_components/info-tooltip'
import { useCurrencyState, usePeriodState } from '@/app/_utils/query-state'
import { TableCell, TableRow } from '@/components/ui/table'
import Image from 'next/image'
import Link from 'next/link'

import type { Period } from '@zk-dashboard/common/lib/period'

type RowData = {
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
    breakdown: BreakdownData
  }
  batchCostNormalized: {
    usd: string
    eth: string
    breakdown: BreakdownData
  }
}

interface StatsRowProps {
  data: Record<Period, RowData>
}

export function StatsRow({ data }: StatsRowProps) {
  const [currency] = useCurrencyState()
  const [period] = usePeriodState()

  const dataForPeriod = data[period]
  const currencySymbol = currency === 'usd' ? '$' : 'ETH'

  return (
    <TableRow className="tabular-nums">
      <TableCell className="flex gap-2">
        <div className="flex size-5 items-center">
          <Image
            src={dataForPeriod.logo}
            alt={`${dataForPeriod.blockchain}-logo`}
            width={10}
            height={10}
            className="size-auto"
          />
        </div>
        <Link className="hover:underline" href={dataForPeriod.blockchainPath}>
          {dataForPeriod.blockchain}
        </Link>
      </TableCell>
      <TableCell>
        {dataForPeriod.finality.value}{' '}
        {dataForPeriod.finality.additionalInfo && (
          <InfoTooltip
            contentClassName="w-auto"
            content={
              <AdditionalInfo
                label=""
                data={dataForPeriod.finality.additionalInfo}
              />
            }
          />
        )}
      </TableCell>
      <TableCell>{dataForPeriod.finalityNormalized}</TableCell>
      <TableCell>{dataForPeriod.batchSize}</TableCell>
      <TableCell>
        <span>{currencySymbol}</span> {dataForPeriod.batchCost[currency]}{' '}
        <InfoTooltip
          contentClassName="w-auto"
          content={
            <Breakdown
              currency={currency}
              data={dataForPeriod.batchCost.breakdown}
            />
          }
        />
      </TableCell>
      <TableCell>
        <span>{currencySymbol}</span>{' '}
        {dataForPeriod.batchCostNormalized[currency]}{' '}
        <InfoTooltip
          contentClassName="w-auto"
          content={
            <Breakdown
              currency={currency}
              data={dataForPeriod.batchCostNormalized.breakdown}
            />
          }
        />
      </TableCell>
    </TableRow>
  )
}
