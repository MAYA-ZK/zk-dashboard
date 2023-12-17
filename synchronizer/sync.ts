import { logger } from '@zk-dashboard/common/lib/logger'

import { syncEthUsdPrices } from './ethereum/price'
import { syncPolygonZkEvm } from './polygon-zk-evm/sync'
import { syncScroll } from './scroll/sync'
import { syncZkSyncEra } from './zk-sync-era/sync'

const SLEEP_FOR = 20 * 60 * 1000 // 20 minutes

export async function sync() {
  logger.info('START SYNCING')

  await syncEthUsdPrices()
  await syncScroll()
  await syncZkSyncEra()
  await syncPolygonZkEvm()

  logger.info(`DONE SYNCING SLEEPING FOR ${SLEEP_FOR / 60 / 1000} MINUTES...`)
  await new Promise((resolve) => setTimeout(resolve, SLEEP_FOR))
  await sync()
}
