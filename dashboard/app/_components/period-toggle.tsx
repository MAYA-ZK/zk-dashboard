'use client'

import { usePeriodState } from '@/app/_utils/query-state'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import type { Period } from '@zk-dashboard/common/lib/period'

const PERIODS = [
  {
    value: '1_day',
    label: '1D',
  },
  {
    value: '7_days',
    label: '7D',
  },
  {
    value: '30_days',
    label: '30D',
  },
  {
    value: '90_days',
    label: '90D',
  },
] as const satisfies Array<{ value: Period; label: string }>

export function PeriodToggle() {
  const [period, setPeriod] = usePeriodState()
  return (
    <ToggleGroup
      value={period}
      onValueChange={(value: Period) => {
        if (value) {
          setPeriod(value)
        }
      }}
      variant="outline"
      type="single"
    >
      {PERIODS.map(({ value, label }) => {
        return (
          <ToggleGroupItem key={value} value={value} className="w-12">
            {label}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
