import { toDate } from 'date-fns'
import { z } from 'zod'

const zkSyncEraRpcBlockSchemaBase = z.object({
  baseSystemContractsHashes: z.object({
    bootloader: z.string(),
    default_aa: z.string(),
  }),
  commitTxHash: z.string(),
  committedAt: z.string(),
  executeTxHash: z.string(),
  executedAt: z.string(),
  // currently the API returns a number, but other APIs return a string with a hex number
  l1GasPrice: z.coerce.bigint(),
  l1TxCount: z.number(),
  // currently the API returns a number, but other APIs return a string with a hex number
  l2FairGasPrice: z.coerce.bigint(),
  l2TxCount: z.number(),
  // currently the API returns a number, but other APIs return a string with a hex number
  number: z.coerce.bigint(),
  proveTxHash: z.string(),
  provenAt: z.string(),
  rootHash: z.string(),
  status: z.union([
    z.enum(['sealed', 'verified']),
    z.string().and(z.object({})),
  ]),
  timestamp: z.number().transform((timestamp) => toDate(timestamp * 1000)),
})

const zkSyncEraRpcBlockSealedSchema = zkSyncEraRpcBlockSchemaBase.extend({
  commitTxHash: z.string().nullable(),
  committedAt: z.string().nullable(),
  executeTxHash: z.string().nullable(),
  executedAt: z.string().nullable(),
  proveTxHash: z.string().nullable(),
  provenAt: z.string().nullable(),
  status: z.literal('sealed'),
})

const zkSyncEraRpcBlockVerifiedSchema = zkSyncEraRpcBlockSchemaBase.extend({
  commitTxHash: z.string(),
  committedAt: z.string(),
  executeTxHash: z.string(),
  executedAt: z.string(),
  proveTxHash: z.string(),
  provenAt: z.string(),
  status: z.literal('verified'),
})

export const zkSyncEraRpcBlockSchema = z.discriminatedUnion('status', [
  zkSyncEraRpcBlockSealedSchema,
  zkSyncEraRpcBlockVerifiedSchema,
])
