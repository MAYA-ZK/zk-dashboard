import { format, subDays } from 'date-fns'
import { Mobula } from 'mobula-sdk'

import { usdToCents } from '../lib/currency'
import { roundNumber } from '../lib/math'

const mobula = new Mobula({
  apiKeyAuth: process.env.MOBULA_API_KEY,
})

/**
 * Fetches price history for an asset
 * @param asset 'Ethereum'
 * @param from number of days
 * @returns price history
 */
const getPriceHistory = async (
  asset: 'Ethereum',
  options?: { from?: number; to?: number }
) => {
  const response = await mobula.fetchAssetMarketHistory({
    asset,
    ...options,
  })
  if (response.statusCode !== 200) {
    throw new Error('Failed to fetch price history')
  }

  return (response.marketHistoryResponse?.data?.priceHistory ?? []) as Array<
    [number, number]
  >
}

export const mobulaApi = {
  getPriceHistory,
  getDailyAveragePrice: async (asset: 'Ethereum', days: number) => {
    const priceHistory = await mobulaApi.getPriceHistory(asset, {
      from: subDays(new Date(), days).getTime(),
    })

    const pricesPerDay = priceHistory.reduce(
      (acc, [timestamp, price]) => {
        const date = format(timestamp, 'yyyy-MM-dd')
        const prev = acc[date] || []

        return {
          ...acc,
          [date]: [...prev, roundNumber(usdToCents(price))],
        }
      },
      {} as Record<string, Array<number>>
    )

    return Object.entries(pricesPerDay).map(([date, prices]) => {
      const averagePrice = roundNumber(
        prices.reduce((acc, price) => acc + price, 0) / prices.length
      )

      return {
        date,
        averagePrice,
      }
    })
  },
}
