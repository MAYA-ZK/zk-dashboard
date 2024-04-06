import type { Currency } from '@zk-dashboard/common/lib/currency'

export const formatToUsd = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format

export function formatDate(
  date: Date,
  config?: { locales?: string; options?: Intl.DateTimeFormatOptions }
) {
  return new Intl.DateTimeFormat(config?.locales, config?.options).format(date)
}

export function formatStringNumber(number: string, decimals = 2) {
  const split = number.split('.')
  const num = split[0]
  const decimal = split[1]

  if (decimal) {
    return `${num}.${decimal.slice(0, decimals)}`
  }

  return num
}

export function getCurrencySymbol(currency: Currency) {
  return currency === 'usd' ? '$' : 'ETH'
}

export function formatCurrency(
  currency: Currency,
  value: number | string,
  decimals = 2
) {
  if (currency === 'usd') {
    return formatToUsd(Number(value))
  }
  return `${getCurrencySymbol(currency)} ${formatStringNumber(value.toString(), decimals)}`
}
