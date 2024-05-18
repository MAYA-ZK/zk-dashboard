import BigNumber from 'bignumber.js'
import type { FMT_BYTES, FMT_NUMBER } from 'web3'
import Web3 from 'web3'

import { BLOCK_PI_API_URL, blockPiThrottle } from '../blockpi'

export type LineaRpcBlock = Awaited<ReturnType<typeof getBlock>>

const linea = new Web3(BLOCK_PI_API_URL.LINEA).eth

const getBlock = (
  ...args: Parameters<
    typeof linea.getBlock<{
      readonly number: FMT_NUMBER.BIGINT
      readonly bytes: FMT_BYTES.HEX
    }>
  >
) =>
  linea.getBlock(...args).then((block) => ({
    ...block,
    timestamp: new Date(
      BigNumber(block.timestamp.toString()).times(1_000).toNumber()
    ),
  }))

export const lineaRpc = {
  getBlock: blockPiThrottle(getBlock),
}
