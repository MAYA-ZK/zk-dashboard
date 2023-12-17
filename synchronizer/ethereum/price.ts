import { differenceInDays } from 'date-fns'
import _ from 'lodash'

import { ethUsdPrice } from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import { mobulaApi } from '@zk-dashboard/common/integrations/mobula'
import { logger } from '@zk-dashboard/common/lib/logger'

import { LOGGER_CONFIG } from './constants'

const DATA_FOR_DAYS = 91
const LATEST_DATA_FOR_DAYS = 4
const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.price,
}

const insertEthUsdPrice = async (
  data: Array<typeof ethUsdPrice.$inferInsert>
) => {
  const [latestData, olderData] = _.partition(data, (item) => {
    return differenceInDays(new Date(), item.date) < LATEST_DATA_FOR_DAYS
  })

  logger.info(
    LOGGER_TAG,
    `inserting latest data starting from ${latestData[0]?.date} to ${latestData[latestData.length - 1]?.date}...`
  )
  await db.transaction(async (tx) => {
    await Promise.all(
      latestData.map((item) => {
        // if the date is within 4 days, we want to update the price, to ensure we update the daily price and
        // that when there is a bug and we miss a day, we can still update the price
        return tx
          .insert(ethUsdPrice)
          .values(item)
          .onConflictDoUpdate({
            target: ethUsdPrice.date,
            set: {
              price: item.price,
            },
          })
      })
    )
  })

  logger.info(
    LOGGER_TAG,
    `inserting (or skipping) older data starting from ${olderData[0]?.date} to ${olderData[olderData.length - 1]?.date}...`
  )
  await db.insert(ethUsdPrice).values(olderData).onConflictDoNothing()
}

export async function syncEthUsdPrices() {
  logger.info(LOGGER_TAG, 'syncing eth usd prices')

  const dailyAveragePrices = await mobulaApi.getDailyAveragePrice(
    'Ethereum',
    DATA_FOR_DAYS
  )

  await insertEthUsdPrice(
    dailyAveragePrices.map((item) => {
      return { date: new Date(item.date), price: item.averagePrice }
    })
  )

  logger.info(LOGGER_TAG, 'done syncing eth usd prices')
}
