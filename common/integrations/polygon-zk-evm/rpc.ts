import BigNumber from 'bignumber.js'
import { isValid } from 'date-fns'
import type { FMT_BYTES, FMT_NUMBER } from 'web3'
import Web3, { core, utils } from 'web3'
import { type z } from 'zod'

import { BLOCK_PI_API_URL, blockPiThrottle } from '../blockpi'
import { polygonZkEvmRpcBatchSchema } from './schema'

const requestManagerPolygonZkEvm = new core.Web3RequestManager(
  BLOCK_PI_API_URL.POLYGON_ZK_EVM
)

const polygonZkEvm = new Web3(BLOCK_PI_API_URL.POLYGON_ZK_EVM).eth

export type PolygonZkEvmRpcBlock = Awaited<ReturnType<typeof getBlock>>
export type PolygonZkEvmRpcBatch = z.infer<typeof polygonZkEvmRpcBatchSchema>

const getLatestBatchNumber = blockPiThrottle(async () => {
  const hexNumber = await requestManagerPolygonZkEvm.send<string, string>({
    method: 'zkevm_batchNumber',
    params: [],
  })
  return Number(utils.hexToNumber(hexNumber))
})

const getBatch = blockPiThrottle(
  async (batchNumber: number | 'latest'): Promise<PolygonZkEvmRpcBatch> => {
    const response = await requestManagerPolygonZkEvm.send<string, unknown>({
      method: 'zkevm_getBatchByNumber' as const,
      params: [batchNumber],
    })

    return polygonZkEvmRpcBatchSchema.parseAsync(response)
  }
)

// Latest batches have invalid date for quite some time, so we need to get the latest valid batch from the API
const getLatestBatch = async (
  batchNumber: number | 'latest' = 'latest'
): ReturnType<typeof getBatch> => {
  const latestBatch = await getBatch(batchNumber)

  if (isValid(latestBatch.timestamp)) {
    return latestBatch
  }

  return getLatestBatch(
    BigNumber(latestBatch.number.toString()).minus(1).toNumber()
  )
}

const getBlock = (
  ...args: Parameters<
    typeof polygonZkEvm.getBlock<{
      readonly number: FMT_NUMBER.BIGINT
      readonly bytes: FMT_BYTES.HEX
    }>
  >
) =>
  polygonZkEvm.getBlock(...args).then((block) => ({
    ...block,
    timestamp: new Date(
      BigNumber(block.timestamp.toString()).times(1_000).toNumber()
    ),
  }))

export const polygonZkEvmRpc = {
  getBlock: blockPiThrottle(getBlock),
  // Custom methods
  getLatestBatchNumber: getLatestBatchNumber,
  getBatch: blockPiThrottle(async (batchNumber: number | 'latest') => {
    if (batchNumber === 'latest') {
      return getLatestBatch(batchNumber)
    }

    return getBatch(batchNumber)
  }),
}
