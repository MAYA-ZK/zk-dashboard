import { desc, sql } from 'drizzle-orm'

import { db } from '@zk-dashboard/common/database/utils'
import { logger } from '@zk-dashboard/common/lib/logger'

import { searchOldestEntity } from './search'
import type { BatchesApi, BatchesTable, GetBatchReturnTYpe } from './types'

export async function getMissingBatchesNumbers({
  table,
  start,
  end,
}: {
  table: BatchesTable
  start: number
  end: number
}) {
  const res = await db.execute(sql`
    WITH BatchNumbers AS (
      SELECT generate_series(${start}::int, ${end}::int) AS INDEX
    )
    SELECT ARRAY (
        SELECT INDEX
        FROM BatchNumbers
          LEFT JOIN ${table} ON BatchNumbers.INDEX = ${table.number}
        WHERE ${table.number} IS NULL
        ORDER BY INDEX
      );
  `)

  return res[0]?.array as Array<number>
}

/**
 * Get the oldest batch from the API, which is MAX_DATA_AGE_IN_DAYS old.
 */
export async function getOldestBatchFromApi<TBatch extends GetBatchReturnTYpe>({
  getBatch,
  loggerTag,
  maxDataAgeInDays,
  entityNumberSpan,
}: {
  getBatch: (...args: Parameters<BatchesApi['getBatch']>) => Promise<TBatch>
  loggerTag: Record<string, string>
  maxDataAgeInDays: number
  entityNumberSpan: number
}): Promise<TBatch> {
  const latestBatch = await getBatch('latest')

  if (!latestBatch) {
    throw new Error('could not get the latest batch from the API')
  }

  logger.info(
    loggerTag,
    `latest batch number: ${latestBatch.number}, searching for the oldest batch...`
  )

  return searchOldestEntity({
    probablyOldestEntity: latestBatch,
    latestEntity: latestBatch,
    getEntity: getBatch,
    entityName: 'batch',
    entityNumberSpan,
    loggerTag,
    maxDataAgeInDays,
  })
}

export function getBatchesByNumbers<
  TBatch extends Awaited<ReturnType<BatchesApi['getBatch']>>,
>(
  batchesNumbers: Array<number>,
  getBatch: (...args: Parameters<BatchesApi['getBatch']>) => Promise<TBatch>
) {
  return Promise.all(
    batchesNumbers.map(async (batchNumber) => {
      return getBatch(batchNumber)
    })
  )
}

export async function getLastInsertedBatchNumber(table: BatchesTable) {
  const lastInsertedBatch = await db
    .select({ number: table.number })
    .from(table)
    .orderBy(desc(table.number))
    .limit(1)

  return lastInsertedBatch?.[0]?.number
}

export function createBatchSynchronizer<TBatch extends GetBatchReturnTYpe>({
  table,
  getBatch,
  loggerTag,
  maxDataAgeInDays,
  entityNumberSpan,
  maxBatchesToGet,
  batchesChunkSize,
  insertBatches,
}: {
  table: BatchesTable
  loggerTag: Record<string, string>
  maxDataAgeInDays: number
  entityNumberSpan: number
  maxBatchesToGet: number
  batchesChunkSize: number
  getBatch: (...args: Parameters<BatchesApi['getBatch']>) => Promise<TBatch>
  insertBatches: (batches: Array<TBatch>) => Promise<unknown>
}) {
  const syncBatches = async (
    lastInsertedBatchNumberArg?: number
  ): Promise<void> => {
    logger.info(
      loggerTag,
      `syncing batches ${lastInsertedBatchNumberArg ? 'starting ' + lastInsertedBatchNumberArg + ' batch number' : ''}...`
    )

    const latestBatch = await getBatch('latest')
    const latestBatchNumber = Number(latestBatch.number)
    const lastInsertedBatchNumber = Number(
      lastInsertedBatchNumberArg ?? (await getLastInsertedBatchNumber(table))
    )

    if (!lastInsertedBatchNumber) {
      logger.info(loggerTag, `no batches in the database`)
      const oldestBatchFromAPI = await getOldestBatchFromApi({
        loggerTag,
        maxDataAgeInDays,
        entityNumberSpan,
        getBatch,
      })

      if (!oldestBatchFromAPI) {
        const message = `could not find oldest batch in the API`
        logger.error(loggerTag, message)
        throw new Error(message)
      }
      logger.info(
        loggerTag,
        `inserting first batch ${oldestBatchFromAPI.number} from the API...`
      )
      await insertBatches([oldestBatchFromAPI])
      return syncBatches(Number(oldestBatchFromAPI.number))
    }

    const missingBatchesNumber = await getMissingBatchesNumbers({
      table,
      start: lastInsertedBatchNumber + 1,
      end:
        lastInsertedBatchNumber + maxBatchesToGet > latestBatchNumber
          ? latestBatchNumber
          : lastInsertedBatchNumber + maxBatchesToGet,
    })

    logger.info(
      loggerTag,
      `missing ${missingBatchesNumber.length} batches from ${lastInsertedBatchNumber} to ${latestBatchNumber}`
    )

    for (let i = 0; i < missingBatchesNumber.length; i += batchesChunkSize) {
      const missingBatchesNumbersChunk = missingBatchesNumber.slice(
        i,
        i + batchesChunkSize
      )
      logger.info(
        loggerTag,
        `getting missing batches from ${missingBatchesNumbersChunk[0]} to ${missingBatchesNumbersChunk[missingBatchesNumbersChunk.length - 1]}...`
      )

      const batchesByNumber = await getBatchesByNumbers(
        missingBatchesNumbersChunk,
        getBatch
      )
      await insertBatches(batchesByNumber)
    }

    logger.info(loggerTag, `inserted ${missingBatchesNumber.length} batches`)

    if (missingBatchesNumber.length === maxBatchesToGet) {
      return syncBatches(missingBatchesNumber[missingBatchesNumber.length - 1])
    }

    logger.info(loggerTag, `done syncing batches`)
  }

  return syncBatches
}
