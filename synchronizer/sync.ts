import { refreshPolygonZkEvmMaterializedViews } from '@zk-dashboard/common/database/materialized-view/polygon-zk-evm'
import { refreshScrollMaterializedViews } from '@zk-dashboard/common/database/materialized-view/scroll'
import { refreshZkSyncEraMaterializedViews } from '@zk-dashboard/common/database/materialized-view/zk-sync-era'
import {
  lineTxLogs,
  lineaTransactions,
} from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import { etherscan } from '@zk-dashboard/common/integrations/ethereum/etherscan'
import {
  ethereum,
  ethereumRpc,
} from '@zk-dashboard/common/integrations/ethereum/rpc'
import { logger } from '@zk-dashboard/common/lib/logger'

import { syncEthUsdPrices } from './ethereum/price'
import { syncPolygonZkEvm } from './polygon-zk-evm/sync'
import { syncScroll } from './scroll/sync'
import { syncZkSyncEra } from './zk-sync-era/sync'

const SLEEP_FOR = 20 * 60 * 1_000 // 20 minutes
const REFRESH_RATE = 6

export async function getTransactions() {
  console.log('START')
  // console.log(
  //   await ethereum.getTransaction(
  //     '0x728980619f4a96af8b47336eb5425f90805b45942f7425969a038392e8989170'
  //   )
  // )
  // console.log(
  //   await ethereum.getPastLogs({
  //     address: '0xd19d4B5d358258f05D7B411E21A1460D11B0876F',
  //     topics: [
  //       // '0x174b4a2e83ebebaf6824e559d2bab7b7e229c80d211e98298a1224970b719a42',
  //       '0x5c885a794662ebe3b08ae0874fc2c88b5343b0223ba9cd2cad92b69c0d0c901f',
  //     ],
  //     fromBlock: '19694000',
  //     toBlock: 'latest',
  //   })
  // )
  // https://api.etherscan.io/api?module=account&action=txlist&address=0xd19d4B5d358258f05D7B411E21A1460D11B0876F&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=SPXSJRXCZVPYTZG813K8A3WGKZ2NR6VJ9I

  let prevTransactions: Awaited<
    ReturnType<typeof etherscan.getAccountTransactions>
  > = []
  let page = 1

  while (true) {
    console.log('LOOP')

    try {
      const transactions = await etherscan.getAccountTransactions({
        queries: {
          address: '0xd19d4B5d358258f05D7B411E21A1460D11B0876F',
          page: page,
          offset: 100,
          sort: 'desc',
          endblock: 99999999,
          startblock: 0,
        },
      })

      const filteredDuplicates = transactions.filter((transaction) => {
        return !prevTransactions.some((prevTransaction) => {
          return prevTransaction.hash === transaction.hash
        })
      })

      console.log('filteredDuplicates', filteredDuplicates.length)

      await db
        .insert(lineaTransactions)
        .values(filteredDuplicates)
        .onConflictDoNothing()

      prevTransactions = transactions
      page++
    } catch (e) {
      console.log('ERROR', e)
      continue
    }
  }

  console.log('END')
}

export async function sync() {
  console.log('START')
  const span = 100

  const startBlock = 19680231
  const endBlock = 19695175

  let start = startBlock
  let end = startBlock + span

  while (end < endBlock) {
    const logs = await ethereum.getPastLogs({
      address: '0xd19d4B5d358258f05D7B411E21A1460D11B0876F',
      topics: [
        // '0x174b4a2e83ebebaf6824e559d2bab7b7e229c80d211e98298a1224970b719a42',
        '0x5c885a794662ebe3b08ae0874fc2c88b5343b0223ba9cd2cad92b69c0d0c901f',
      ],
      fromBlock: start,
      toBlock: end,
    })

    console.log('logs', logs.length)
    console.log('blocks left', endBlock - end)

    if (logs.length === 0) {
      start = end
      end = start + span
      continue
    }

    await db
      .insert(lineTxLogs)
      .values(
        logs.map((log) => {
          if (typeof log === 'string') {
            throw new Error('log is string')
          }
          return {
            address: log.address,
            topics: log.topics,
            data: log.data,
            block_number: log.blockNumber,
            transaction_hash: log.transactionHash,
            transaction_index: log.transactionIndex,
            block_hash: log.blockHash,
            log_index: log.logIndex,
            removed: log.removed,
          }
        })
      )
      .onConflictDoNothing()

    start = end
    end = start + span
  }

  console.log('END')
}

// export async function syncOld(runNumber = 0) {
//   logger.info('START SYNCING')

//   await syncEthUsdPrices()
//   await syncScroll()
//   await syncZkSyncEra()
//   await syncPolygonZkEvm()

//   if (runNumber === 0) {
//     // Some views take long time to refresh,
//     // there is no need to refresh so frequently, since we show > 1 day data
//     await refreshScrollMaterializedViews()
//     await refreshZkSyncEraMaterializedViews()
//     await refreshPolygonZkEvmMaterializedViews()
//   }
//   logger.info(`DONE SYNCING SLEEPING FOR ${SLEEP_FOR / 60 / 1_000} MINUTES...`)
//   await new Promise((resolve) => setTimeout(resolve, SLEEP_FOR))

//   await sync(runNumber >= REFRESH_RATE ? 0 : runNumber + 1)
// }
