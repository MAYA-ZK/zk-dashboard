import BigNumber from 'bignumber.js'
import type { FMT_BYTES, FMT_NUMBER } from 'web3'
import Web3 from 'web3'

import { calculateTransactionFee } from '../../lib/transactions'
import { BLOCK_PI_API_URL, blockPiThrottle } from '../blockpi'

export const ethereum = new Web3(BLOCK_PI_API_URL.ETHEREUM).eth

export type EthereumTransactionReceipt = Awaited<
  ReturnType<typeof ethereum.getTransactionReceipt>
>

export type EthereumRpcBlock = Awaited<ReturnType<typeof getBlock>>

const getBlock = async (
  ...args: Parameters<
    typeof ethereum.getBlock<{
      readonly number: FMT_NUMBER.BIGINT
      readonly bytes: FMT_BYTES.HEX
    }>
  >
) => {
  const block = await ethereum.getBlock(...args)
  return {
    ...block,
    timestamp: new Date(
      BigNumber(block.timestamp.toString()).times(1_000).toNumber()
    ),
  }
}

const getPastLogs = async (
  ...args: Parameters<typeof ethereum.getPastLogs>
) => {
  return ethereum.getPastLogs(...args)
}

export const ethereumRpc = {
  getTransactionReceipt: blockPiThrottle(
    (...args: Parameters<typeof ethereum.getTransactionReceipt>) => {
      return ethereum.getTransactionReceipt(...args)
    }
  ),
  // Custom methods
  /**
   *
   * @param shouldDivideDeprecated scroll batch transactions fees are divided by 1e18, it should be migrated to the new method and this parameter should be removed
   */
  getEffectiveTransactionPriceByHash: blockPiThrottle(async (hash: string) => {
    const transactionReceipt = await ethereum.getTransactionReceipt(hash)

    const transactionFee = calculateTransactionFee(
      transactionReceipt.gasUsed.toString(),
      transactionReceipt.effectiveGasPrice?.toString() ?? 0
    )

    return transactionFee
  }),
  getBlock: blockPiThrottle(getBlock),
  getPastLogs: blockPiThrottle(getPastLogs),
}
