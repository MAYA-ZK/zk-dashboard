'use client'

import { ComingSoonRow } from '@/app/_components/coming-soon-row'
import type { StatsRowData } from '@/app/_components/stats/columns'
import { columns } from '@/app/_components/stats/columns'
import { DataTable } from '@/app/_components/stats/data-table'
import { useCurrencyState, usePeriodState } from '@/app/_utils/query-state'

import type { Period } from '@zk-dashboard/common/lib/period'

const COMING_SOON_ROLLUPS: Array<{
  blockchain: string
  logo: string
}> = [
  // currently there are no plans for adding more rollups.
]

export function StatsTableInteractive({
  data,
}: {
  data: Array<Record<Period, StatsRowData>>
}) {
  const [currency] = useCurrencyState()
  const [period] = usePeriodState()

  const specificData = data.map((row) => row[period])

  return (
    <DataTable
      meta={{ currency, period }}
      columns={columns}
      data={specificData}
      extraRows={COMING_SOON_ROLLUPS.map((row) => {
        return (
          <ComingSoonRow
            key={row.blockchain}
            logo={row.logo}
            blockchain={row.blockchain}
          />
        )
      })}
    />
  )
}
