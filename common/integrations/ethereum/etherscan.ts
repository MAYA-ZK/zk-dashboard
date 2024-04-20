import { Zodios } from '@zodios/core'
import { mediumint } from 'drizzle-orm/mysql-core'
import pThrottle from 'p-throttle'
import { z } from 'zod'

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api'
const API_KEY_QUERY_PARAM = `apikey=${process.env.ETHERSCAN_API_KEY}`

/**
 * Free plan limits: 5 requests per second
 */
export const etherscanThrottle = pThrottle({
  limit: 1,
  interval: 2000, // add a little buffer
})

// https://api.etherscan.io/api
//    ?module=account
//    &action=txlist
//    &address=0xd19d4B5d358258f05D7B411E21A1460D11B0876F
//    &startblock=0
//    &endblock=99999999
//    &page=1
//    &offset=10
//    &sort=asc
//    &apikey=SPXSJRXCZVPYTZG813K8A3WGKZ2NR6VJ9I

// "blockNumber": "19694821",
// "timeStamp": "1713594275",
// "hash": "0x09032e2857e320730b12ea5ce87172b0717c08ec9cc763f922e61dfbe96f4f7a",
// "nonce": "181",
// "blockHash": "0x8c40f96af71e52e4e630b163bf654c3d0476a4e4c26053c62805df4e92a900f2",
// "transactionIndex": "167",
// "from": "0x7d56e162a044a6b327332d3e6ce4f68470440373",
// "to": "0xd19d4b5d358258f05d7b411e21a1460d11b0876f",
// "value": "343720001484000",
// "gas": "102463",
// "gasPrice": "6471665923",
// "isError": "0",
// "txreceipt_status": "1",
// "input": "0x9f3ce55a0000000000000000000000007d56e162a044a6b327332d3e6ce4f6847044037300000000000000000000000000000000000000000000000000000b919b2b84e000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
// "contractAddress": "",
// "cumulativeGasUsed": "20514511",
// "gasUsed": "67458",
// "confirmations": "1",
// "methodId": "0x9f3ce55a",
// "functionName": "sendMessage(address _receiver, uint256 _dstChainId, bytes _message)"

// "blockNumber": "17680091",
// "timeStamp": "1689196619",
// "hash": "0xa5c2a27a6c99015ff3201983f9bd70e02ca279952fa246b67cf2161388819a87",
// "nonce": "79",
// "blockHash": "0x408ae8a8148a1128703937dff60faa65b96e09c51c620ab073ba630540404808",
// "transactionIndex": "57",
// "from": "0xfe5b95b0f1d5e43d639d4986c4dd019be3be556e",
// "to": "0xd19d4b5d358258f05d7b411e21a1460d11b0876f",
// "value": "210000000000000000",
// "gas": "99283",
// "gasPrice": "25071426825",
// "isError": "0",
// "txreceipt_status": "1",
// "input": "0x9f3ce55a000000000000000000000000fe5b95b0f1d5e43d639d4986c4dd019be3be556e000000000000000000000000000000000000000000000000000e35fa931a000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
// "contractAddress": "",
// "cumulativeGasUsed": "4349320",
// "gasUsed": "65647",
// "confirmations": "2014893",
// "methodId": "0x9f3ce55a",
// "functionName": "sendMessage(address _receiver, uint256 _dstChainId, bytes _message)"

export const etherscanApi = new Zodios(ETHERSCAN_API_URL, [
  {
    method: 'get',
    path: `/?module=account&action=txlist&{${API_KEY_QUERY_PARAM}`,
    alias: 'getAccountTransactions',
    parameters: [
      { type: 'Query', name: 'address', schema: z.string() },
      { type: 'Query', name: 'startblock', schema: z.number() },
      { type: 'Query', name: 'endblock', schema: z.number() },
      { type: 'Query', name: 'page', schema: z.number() },
      { type: 'Query', name: 'offset', schema: z.number() },
      { type: 'Query', name: 'sort', schema: z.enum(['asc', 'desc']) },
    ],
    response: z
      .object({
        status: z.string(),
        result: z.array(
          z.object({
            blockNumber: z.string(),
            timeStamp: z.string(),
            hash: z.string(),
            nonce: z.string(),
            blockHash: z.string(),
            transactionIndex: z.string(),
            from: z.string(),
            to: z.string(),
            value: z.string(),
            gas: z.string(),
            gasPrice: z.string(),
            isError: z.string(),
            txreceipt_status: z.string(),
            input: z.string(),
            contractAddress: z.string(),
            cumulativeGasUsed: z.string(),
            gasUsed: z.string(),
            confirmations: z.string(),
            methodId: z.string(),
            functionName: z.string(),
          })
        ),
      })
      .transform((data) => data.result),
  },
])

export const etherscan = {
  getAccountTransactions: etherscanThrottle(
    etherscanApi.getAccountTransactions
  ),
}
