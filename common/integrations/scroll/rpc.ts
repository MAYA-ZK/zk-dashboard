import BigNumber from 'bignumber.js'
import type { FMT_BYTES, FMT_NUMBER } from 'web3'
import Web3 from 'web3'

import { BLOCK_PI_API_URL, blockPiThrottle } from '../blockpi'
import { getBatch } from './rollup-scan'

const scroll = new Web3(BLOCK_PI_API_URL.SCROLL).eth

export type ScrollRpcBlock = Awaited<ReturnType<typeof getBlock>>
export type ScrollRpcBatch = Awaited<ReturnType<typeof getBatch>>

const getBlock = (
  ...args: Parameters<
    typeof scroll.getBlock<{
      readonly number: FMT_NUMBER.BIGINT
      readonly bytes: FMT_BYTES.HEX
    }>
  >
) =>
  scroll.getBlock(...args).then((block) => ({
    ...block,
    timestamp: new Date(
      BigNumber(block.timestamp.toString()).times(1_000).toNumber()
    ),
  }))

export const scrollRpc = {
  getBlock: blockPiThrottle(getBlock),
  getBatch: getBatch, // This API (scroll rollup scan) is not rate limited at the moment
}
