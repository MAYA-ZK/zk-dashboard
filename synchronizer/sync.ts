import pTimeout, { TimeoutError } from 'p-timeout'

import { refreshLineaMaterializedViews } from '@zk-dashboard/common/database/materialized-view/linea'
import { refreshPolygonZkEvmMaterializedViews } from '@zk-dashboard/common/database/materialized-view/polygon-zk-evm'
import { refreshScrollMaterializedViews } from '@zk-dashboard/common/database/materialized-view/scroll'
import { refreshZkSyncEraMaterializedViews } from '@zk-dashboard/common/database/materialized-view/zk-sync-era'
import { logger } from '@zk-dashboard/common/lib/logger'

import { syncEthUsdPrices } from './ethereum/price'
import { syncLinea } from './linea/sync'
import { syncPolygonZkEvm } from './polygon-zk-evm/sync'
import { syncScroll } from './scroll/sync'
import { syncZkSyncEra } from './zk-sync-era/sync'

const SLEEP_FOR = 20 * 60 * 1_000 // 20 minutes
const REFRESH_RATE = 6
const MAX_SYNC_RUN_TIME = 1_000 * 60 * 60 * 1 // 1 hour

export async function sync(runNumber = 0) {
  logger.info('START SYNCING')

  const runDataSync = async () => {
    await syncEthUsdPrices()
    await syncScroll()
    await syncZkSyncEra()
    await syncPolygonZkEvm()
    await syncLinea()
  }

  await pTimeout(runDataSync(), {
    // Expect for initial run, sync should not take more than 1 hour.
    // Thats the sign that something went wrong.
    milliseconds: MAX_SYNC_RUN_TIME,
    fallback: () => {
      throw new TimeoutError(
        `runDataSync timeout after ${MAX_SYNC_RUN_TIME} ms`
      )
    },
  })

  if (runNumber >= REFRESH_RATE) {
    // Some views take long time to refresh,
    // there is no need to refresh so frequently, since we show > 1 day data
    await refreshScrollMaterializedViews()
    await refreshZkSyncEraMaterializedViews()
    await refreshPolygonZkEvmMaterializedViews()
    await refreshLineaMaterializedViews()
  }

  logger.info(`DONE SYNCING SLEEPING FOR ${SLEEP_FOR / 60 / 1_000} MINUTES...`)
  await new Promise((resolve) => setTimeout(resolve, SLEEP_FOR))
  await sync(runNumber >= REFRESH_RATE ? 0 : runNumber + 1)
}
