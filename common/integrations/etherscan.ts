import etherscan from 'etherscan-api'
import pThrottle from 'p-throttle'
import type { ZodTypeAny } from 'zod'
import { z } from 'zod'

const api = etherscan.init(process.env.ETHERSCAN_API_KEY)

const throttleAPI = pThrottle({
  limit: 2,
  interval: 1000,
})

const etherscanAPI = {
  stats: {
    ethprice: throttleAPI(api.stats.ethprice),
  },
}

const apiResultSchema = <T extends ZodTypeAny>(resultSchema: T) =>
  z.object({
    status: z.string().optional(),
    message: z.string().optional(),
    jsonrpc: z.string().optional(),
    id: z.number().optional(),
    result: resultSchema,
  })

const ethPriceSchema = z.object({
  ethbtc: z.coerce.number(),
  ethbtc_timestamp: z.string(),
  ethusd: z.coerce.number(),
  ethusd_timestamp: z.string(),
})

export async function getEthLastPrice() {
  return {
    ethbtc: 0.0591676695957292,
    ethbtc_timestamp: '1705244083',
    ethusd: 2537.75390868176,
    ethusd_timestamp: '1705244080',
  }
  const { result } = apiResultSchema(ethPriceSchema).parse(
    await etherscanAPI.stats.ethprice()
  )

  return result
}
