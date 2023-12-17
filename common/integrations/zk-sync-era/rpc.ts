import BigNumber from 'bignumber.js'
import type { FMT_BYTES, FMT_NUMBER } from 'web3'
import Web3, { core, utils } from 'web3'
import type { z } from 'zod'

import { BLOCK_PI_API_URL, blockPiThrottle } from '../blockpi'
import { zkSyncEraRpcBlockSchema } from './schema'

const requestManagerZkSync = new core.Web3RequestManager(
  BLOCK_PI_API_URL.ZK_SYNC_ERA
)

const zkSyncEra = new Web3(BLOCK_PI_API_URL.ZK_SYNC_ERA).eth

export type ZkSyncEraRpcBlock = Awaited<ReturnType<typeof getBlock>>
export type ZkSyncEraRpcBatch = z.infer<typeof zkSyncEraRpcBlockSchema>

const getLatestBatchNumber = blockPiThrottle(async () => {
  const hexNumber = await requestManagerZkSync.send<string, string>({
    method: 'zks_L1BatchNumber',
    params: [],
  })
  return Number(utils.hexToNumber(hexNumber))
})

const getBlock = async (
  ...args: Parameters<
    typeof zkSyncEra.getBlock<{
      readonly number: FMT_NUMBER.BIGINT
      readonly bytes: FMT_BYTES.HEX
    }>
  >
) => {
  const block = await zkSyncEra.getBlock(...args)
  return {
    ...block,
    timestamp: new Date(
      BigNumber(block.timestamp.toString()).times(1_000).toNumber()
    ),
  }
}

export const zkSyncEraRpc = {
  getBlock: blockPiThrottle(getBlock),
  // Custom methods
  getLatestBatchNumber: getLatestBatchNumber,
  getBatch: blockPiThrottle(async (batchNumber: number | 'latest') => {
    let batchNumberNormalized = batchNumber

    if (batchNumber === 'latest') {
      const latestBatchNumber = await getLatestBatchNumber()
      batchNumberNormalized = latestBatchNumber
    }

    const response = await requestManagerZkSync.send<string, unknown>({
      method: 'zks_getL1BatchDetails' as const,
      params: [batchNumberNormalized],
    })

    return zkSyncEraRpcBlockSchema.parseAsync(response)
  }),
}
