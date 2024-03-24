import { parseAsStringEnum, useQueryState } from 'nuqs'

import type { Currency } from '@zk-dashboard/common/lib/currency'
import type { Period } from '@zk-dashboard/common/lib/period'

export const usePeriodState = () => {
  return useQueryState(
    'period',
    parseAsStringEnum<Period>(['7_days', '30_days', '90_days']).withDefault(
      '7_days'
    )
  )
}

export const useCurrencyState = () => {
  return useQueryState(
    'currency',
    parseAsStringEnum<Currency>(['usd', 'eth']).withDefault('usd')
  )
}
