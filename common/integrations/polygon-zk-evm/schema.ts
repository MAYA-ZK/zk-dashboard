import BigNumber from 'bignumber.js'
import { toDate } from 'date-fns'
import { utils } from 'web3'
import { z } from 'zod'

export const polygonZkEvmRpcBatchSchema = z.object({
  number: z.coerce.bigint(),
  timestamp: z.string().transform((value) => {
    // Latest batches have wrong timestamps which could results in invalid dates
    const timestamp = BigNumber(utils.hexToNumberString(value))
      .multipliedBy(1000)
      .toNumber()

    return toDate(timestamp)
  }),
  sendSequencesTxHash: z.string().nullable(),
  verifyBatchTxHash: z.string().nullable(),
  blocks: z.array(z.string()).nullable(),
  transactions: z.array(z.string()).nullable(),
  accInputHash: z.string(),
  closed: z.boolean(),
  coinbase: z.string(),
  globalExitRoot: z.string(),
  localExitRoot: z.string(),
  mainnetExitRoot: z.string(),
  rollupExitRoot: z.string(),
  stateRoot: z.string(),
})
