import * as Sentry from '@sentry/node'

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

export async function sync(runNumber = 0) {
  logger.info('START SYNCING')

  await syncEthUsdPrices()
  await syncScroll()
  await syncZkSyncEra()
  await syncPolygonZkEvm()
  await syncLinea()

  if (runNumber >= REFRESH_RATE) {
    // Some views take long time to refresh,
    // there is no need to refresh so frequently, since we show > 1 day data
    await refreshScrollMaterializedViews()
    await refreshZkSyncEraMaterializedViews()
    await refreshPolygonZkEvmMaterializedViews()
    await refreshLineaMaterializedViews()

    Sentry.metrics.increment('materialized_views_refreshed', 1, {
      timestamp: new Date().getTime(),
    })
  }

  Sentry.metrics.increment('synchronizer_done', 1, {
    timestamp: new Date().getTime(),
  })

  logger.info(`DONE SYNCING SLEEPING FOR ${SLEEP_FOR / 60 / 1_000} MINUTES...`)
  await new Promise((resolve) => setTimeout(resolve, SLEEP_FOR))
  await sync(runNumber >= REFRESH_RATE ? 0 : runNumber + 1)
}
