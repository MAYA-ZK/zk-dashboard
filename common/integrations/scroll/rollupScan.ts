import { Zodios } from '@zodios/core'
import { toDate } from 'date-fns'
import { z } from 'zod'

import { logger } from '../../lib/logger'

const SCROLL_API_URL = 'https://mainnet-api-re.scroll.io/api'

export const scrollBatchSchema = z
  .object({
    index: z.number(),
    hash: z.string(),
    rollup_status: z.string(),
    created_at: z.coerce
      .number()
      .transform((timestamp) => toDate(timestamp * 1000)),
    total_tx_num: z.number(),
    commit_tx_hash: z.string().nullable(),
    finalize_tx_hash: z.string().nullable(),

    committed_at: z.coerce
      .number()
      .transform((n) => new Date(n * 1000))
      .nullable(),
    end_block_number: z.number(),
    end_chunk_hash: z.string(),
    end_chunk_index: z.number(),
    finalized_at: z.coerce
      .number()
      .transform((n) => new Date(n * 1000))
      .nullable(),
    start_block_number: z.number(),
    start_chunk_hash: z.string(),
    start_chunk_index: z.number(),
  })
  .transform((batch) => ({
    ...batch,
    number: batch.index,
    timestamp: batch.created_at,
  }))

const lastBatchIndexesSchema = z.object({
  all_index: z.number(),
  committed_index: z.number(),
  finalized_index: z.number(),
})

export type ScrollBatch = z.infer<typeof scrollBatchSchema>

const scrollRollupScan = new Zodios(SCROLL_API_URL, [
  {
    method: 'get',
    path: '/batches',
    alias: 'getBatches',
    parameters: [
      { type: 'Query', name: 'page', schema: z.number() },
      { type: 'Query', name: 'per_page', schema: z.number() },
    ],
    description: 'Get paginated batches',
    response: z.object({
      batches: z.array(scrollBatchSchema),
      total: z.number(),
    }),
  },
  {
    method: 'get',
    path: '/batch',
    alias: 'getBatch',
    parameters: [{ type: 'Query', name: 'index', schema: z.number() }],
    description: 'Get batch',
    response: z.object({
      batch: scrollBatchSchema,
    }),
  },
  {
    method: 'get',
    path: '/last_batch_indexes',
    alias: 'getLastBatchIndexes',
    description: 'Get batch',
    response: lastBatchIndexesSchema,
  },
])

export async function getTotalBatches() {
  const { total } = await scrollRollupScan.getBatches({
    queries: {
      page: 1,
      per_page: 1,
    },
  })

  return total
}

export async function* getBatchesByIndexes(indexes: Array<number>) {
  let batches: Array<ScrollBatch> = []
  const per_page = 25

  const totalBatches = await getTotalBatches()

  for (const index of indexes) {
    const batchPage = Math.floor(totalBatches / per_page - index / per_page + 1)

    let batch = batches.find((b) => b.index === index)

    if (batch) {
      yield batch
      continue
    }

    batches = (
      await scrollRollupScan.getBatches({
        queries: {
          page: batchPage,
          per_page: per_page,
        },
      })
    ).batches

    batch = batches.find((b) => b.index === index)
    if (batch) {
      yield batch
      continue
    }
  }
}

export async function* scrapeLatestBatches(
  delay: number = 0,
  page: number = 1,
  per_page: number = 25
) {
  let currentPage = page

  while (true) {
    logger.info(`scraping batches page ${currentPage}...`)
    const { batches } = await scrollRollupScan.getBatches({
      queries: {
        page: currentPage,
        per_page,
      },
    })

    for (const batch of batches) {
      yield batch
    }

    await new Promise((resolve) => setTimeout(resolve, delay))

    currentPage++
  }
}

export async function getLatestBatch() {
  const { batches } = await scrollRollupScan.getBatches({
    queries: {
      page: 1,
      per_page: 1,
    },
  })

  const latestBatch = batches[0]

  if (!latestBatch) {
    throw new Error('could not get the latest batch from rollupScan API')
  }

  return latestBatch
}

export async function getBatch(number: 'latest' | number) {
  if (number === 'latest') {
    return getLatestBatch()
  }

  return scrollRollupScan
    .getBatch({
      queries: {
        index: number,
      },
    })
    .then((res) => res.batch)
}
