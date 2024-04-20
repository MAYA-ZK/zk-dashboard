import BigNumber from 'bignumber.js'
import type { FMT_BYTES, FMT_NUMBER } from 'web3'
import Web3 from 'web3'

import { calculateTransactionFee } from '../../lib/transactions'
import { BLOCK_PI_API_URL, blockPiThrottle } from '../blockpi'

export const ethereum = new Web3(BLOCK_PI_API_URL.ETHEREUM).eth

export type EthereumTransactionReceipt = Awaited<
  ReturnType<typeof ethereum.getTransactionReceipt>
>

// curl https://ethereum.blockpi.network/v1/rpc/your-rpc-key -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_getLogs","params":[{"address": "0xd19d4B5d358258f05D7B411E21A1460D11B0876F", "topics": ["0x5c885a794662ebe3b08ae0874fc2c88b5343b0223ba9cd2cad92b69c0d0c901f"]}],"id":1}'
// curl https://ethereum.blockpi.network/v1/rpc/abc7f27bc7feac46327f2ae55ba5a0c7a0328026 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_getLogs","params":[{"address": "0xd19d4B5d358258f05D7B411E21A1460D11B0876F", "topics": ["0x5c885a794662ebe3b08ae0874fc2c88b5343b0223ba9cd2cad92b69c0d0c901f"]}],"id":1}'

// curl https://ethereum.blockpi.network/v1/rpc/abc7f27bc7feac46327f2ae55ba5a0c7a0328026 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0xdd23ad410574222090d3246a8caa3ab928e5bd09d777f4cfecd18e01ed3db5fe"],"id":1}'

// https://api.etherscan.io/api
//    ?module=logs
//    &action=getLogs
//    &address=0xd19d4B5d358258f05D7B411E21A1460D11B0876F
//    &topic0=0x174b4a2e83ebebaf6824e559d2bab7b7e229c80d211e98298a1224970b719a42
//    &page=1
//    &offset=10
//    &apikey=SPXSJRXCZVPYTZG813K8A3WGKZ2NR6VJ9I

// https://api.etherscan.io/api
//    ?module=logs
//    &action=getLogs
//    &address=0xd19d4B5d358258f05D7B411E21A1460D11B0876F
//    &apikey=SPXSJRXCZVPYTZG813K8A3WGKZ2NR6VJ9I

//    https://api.etherscan.io/api?module=account&action=txlist&address=0xd19d4B5d358258f05D7B411E21A1460D11B0876F&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=SPXSJRXCZVPYTZG813K8A3WGKZ2NR6VJ9I

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
