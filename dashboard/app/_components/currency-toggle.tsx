'use client'

import { useCurrencyState } from '@/app/_utils/query-state'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import type { Currency } from '@zk-dashboard/common/lib/currency'

const CURRENCIES = [
  {
    value: 'usd',
    label: 'USD',
  },
  {
    value: 'eth',
    label: 'ETH',
  },
] as const satisfies Array<{ value: 'usd' | 'eth'; label: string }>

export function CurrencyToggle() {
  const [currency, setCurrency] = useCurrencyState()
  return (
    <ToggleGroup
      value={currency}
      onValueChange={(value: Currency) => {
        setCurrency(value)
      }}
      variant="outline"
      type="single"
    >
      {CURRENCIES.map(({ value, label }) => {
        return (
          <ToggleGroupItem key={value} value={value}>
            {label}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
