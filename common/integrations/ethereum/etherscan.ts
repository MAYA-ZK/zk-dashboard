import { Zodios } from '@zodios/core'
import BigNumber from 'bignumber.js'
import { toDate } from 'date-fns'
import pRetry, { AbortError } from 'p-retry'
import pThrottle from 'p-throttle'
import { z } from 'zod'

import { logger } from '../../lib/logger'

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api'
const API_KEY_QUERY_PARAM = `apikey=${process.env.ETHERSCAN_API_KEY}`

/**
 * Free plan limits: 5 requests per second.
 */
export const etherscanThrottle = pThrottle({
  limit: 5,
  interval: 1250, // 1250 ms for extra safety
})

export const etherscanApi = new Zodios(ETHERSCAN_API_URL, [
  {
    // https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-normal-transactions-by-address
    method: 'get',
    path: `/?module=account&action=txlist&${API_KEY_QUERY_PARAM}`,
    alias: 'getAccountTransactions',
    parameters: [
      { type: 'Query', name: 'address', schema: z.string() },
      { type: 'Query', name: 'startblock', schema: z.number() },
      { type: 'Query', name: 'endblock', schema: z.number() },
      { type: 'Query', name: 'page', schema: z.number() },
      { type: 'Query', name: 'offset', schema: z.number() },
      {
        type: 'Query',
        name: 'sort',
        schema: z.enum(['asc', 'desc']).optional(),
      },
    ],
    response: z
      .object({
        status: z.string(),
        result: z
          .array(
            z.object({
              blockNumber: z.coerce.bigint(),
              timeStamp: z.coerce
                .number()
                .transform((timestamp) => toDate(timestamp * 1000)),
              hash: z.string(),
              nonce: z.coerce.bigint(),
              blockHash: z.string(),
              transactionIndex: z.coerce.number(),
              from: z.string(),
              to: z.string(),
              value: z
                .string()
                .transform((value) => BigNumber(value).precision(18)),
              gas: z.coerce.bigint(),
              gasPrice: z.coerce.bigint(),
              isError: z.string(),
              txreceipt_status: z.string(),
              input: z.string(),
              contractAddress: z.string(),
              cumulativeGasUsed: z.coerce.bigint(),
              gasUsed: z.coerce.bigint(),
              confirmations: z.coerce.number(),
              methodId: z.string(),
              functionName: z.string(),
            })
          )
          .or(z.string()),
      })
      .transform((data) => {
        return data.result
      }),
  },
])

class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}

async function getAccountTransactions(
  ...props: Parameters<typeof etherscanApi.getAccountTransactions>
) {
  try {
    const accountTransactions = await etherscanApi.getAccountTransactions(
      ...props
    )

    if (typeof accountTransactions === 'string') {
      const isRateLimitError = accountTransactions.includes(
        'Max rate limit reached'
      )
      if (isRateLimitError) {
        throw new RateLimitError(accountTransactions)
      }
      throw new AbortError(accountTransactions)
    }

    return accountTransactions
  } catch (error) {
    if (error instanceof RateLimitError) {
      logger.warn(error)
      throw error
    }
    if (error instanceof Error || typeof error === 'string') {
      throw new AbortError(error)
    }
    logger.error(error)
    throw new AbortError('unknown error')
  }
}

async function getAccountLatestTransaction(address: string) {
  const latestTransactions = await getAccountTransactions({
    queries: {
      address,
      page: 1,
      offset: 1,
      sort: 'desc',
      endblock: 99999999,
      startblock: 0,
    },
  })

  const latestTransaction = latestTransactions[0]

  if (!latestTransaction) {
    throw new Error('could not get the latest transaction from the API')
  }

  return latestTransaction
}

export const etherscan = {
  getAccountTransactions: etherscanThrottle(
    (...args: Parameters<typeof getAccountTransactions>) =>
      pRetry(() => getAccountTransactions(...args), {
        forever: true,
        minTimeout: 1_000,
      })
  ),
  getAccountLatestTransaction: etherscanThrottle(getAccountLatestTransaction),
}
