import { AdditionalInfo } from '@/app/_components/additional-info'

import type { Currency } from '@zk-dashboard/common/lib/currency'

export type BreakdownData = Record<
  string,
  { usd: string; eth: string; label: string }
>

export function Breakdown({
  data,
  currency,
}: {
  data: BreakdownData
  currency: Currency
}) {
  const additionalData = Object.entries(data).map(([_, value]) => ({
    label: value.label,
    value: `${currency === 'usd' ? '$' : 'ETH'} ${value[currency]}`,
  }))

  return <AdditionalInfo label="Breakdown" data={additionalData} />
}
