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
