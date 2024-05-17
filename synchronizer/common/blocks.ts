import { desc, sql } from 'drizzle-orm'
import pTimeout, { TimeoutError } from 'p-timeout'

import { db } from '@zk-dashboard/common/database/utils'
import { logger } from '@zk-dashboard/common/lib/logger'

import { REQUEST_TIMEOUT } from './constants'
import { searchOldestEntity } from './search'
import type {
  BlocksApi,
  BlocksTable,
  GetBlockReturnType,
  LoggerTag,
} from './types'

export async function getLastInsertedBlockNumber(table: BlocksTable) {
  const lastInsertedBlock = await db
    .select({ number: table.number })
    .from(table)
    .orderBy(desc(table.number))
    .limit(1)

  const lastInsertedBlockNumber = lastInsertedBlock?.[0]?.number

  return lastInsertedBlockNumber ? Number(lastInsertedBlockNumber) : undefined
}

/**
 * Get the oldest block from the API, which is maxDataAgeInDays old.
 */
export async function getOldestBlockFromApi<TBlock extends GetBlockReturnType>({
  getBlock,
  loggerTag,
  maxDataAgeInDays,
  entityNumberSpan,
}: {
  getBlock: (...args: Parameters<BlocksApi['getBlock']>) => Promise<TBlock>
  loggerTag: LoggerTag
  maxDataAgeInDays: number
  entityNumberSpan: number
}): Promise<TBlock> {
  const latestBlock = await getBlock('latest')

  if (!latestBlock) {
    throw new Error('could not get the latest block from the API')
  }

  logger.info(
    loggerTag,
    `latest block number: ${latestBlock.number}, searching for the oldest block...`
  )

  return searchOldestEntity({
    probablyOldestEntity: latestBlock,
    latestEntity: latestBlock,
    getEntity: getBlock,
    entityName: 'block',
    entityNumberSpan,
    loggerTag,
    maxDataAgeInDays,
  })
}

export async function getMissingBlocksNumbers({
  table,
  start,
  end,
}: {
  table: BlocksTable
  start: number
  end: number
}) {
  const res = await db.execute(sql`
    WITH
      BlockNumbers AS (
        SELECT
          generate_series(
            ${start}::int,
            ${end}::int
          ) AS INDEX
      )
    SELECT
      ARRAY(
        SELECT
          INDEX
        FROM
          BlockNumbers
          LEFT JOIN ${table} ON BlockNumbers.INDEX = ${table.number}
        WHERE
          ${table.number} IS NULL
        ORDER BY
          INDEX
      );
  `)

  return res[0]?.array as Array<number>
}

export async function getBlocksByNumbers<
  TBlock extends Awaited<ReturnType<BlocksApi['getBlock']>>,
>(
  blocksNumbers: Array<number>,
  getBlock: (...args: Parameters<BlocksApi['getBlock']>) => Promise<TBlock>
) {
  return Promise.all(
    blocksNumbers.map(async (blockNumber) => {
      return getBlock(blockNumber)
    })
  )
}

export function createBlocksSynchronizer<TBlock extends GetBlockReturnType>({
  entityNumberSpan,
  table,
  loggerTag,
  blocksChunkSize,
  maxDataAgeInDays,
  maxBlocksToGet,
  getBlock,
  insertBlocks,
}: {
  table: BlocksTable
  loggerTag: LoggerTag
  entityNumberSpan: number
  blocksChunkSize: number
  maxDataAgeInDays: number
  maxBlocksToGet: number
  insertBlocks: (blocks: Array<TBlock>) => Promise<unknown>
  getBlock: (...args: Parameters<BlocksApi['getBlock']>) => Promise<TBlock>
}) {
  const syncBlocks = async (
    lastInsertedBlockNumberArg?: number
  ): Promise<void> => {
    logger.info(
      loggerTag,
      `syncing blocks ${lastInsertedBlockNumberArg ? 'starting ' + lastInsertedBlockNumberArg + ' block number' : ''}...`
    )

    const latestBlock = await getBlock('latest')

    const latestBlockNumber = Number(latestBlock.number)
    const lastInsertedBlockNumber =
      lastInsertedBlockNumberArg ?? (await getLastInsertedBlockNumber(table))

    if (!lastInsertedBlockNumber) {
      logger.info(
        loggerTag,
        `no blocks in the database, getting ${maxDataAgeInDays} days old block from the API...`
      )
      const oldestBlockFromAPI = await getOldestBlockFromApi({
        getBlock,
        loggerTag,
        maxDataAgeInDays,
        entityNumberSpan,
      })

      if (!oldestBlockFromAPI) {
        const message = `could not find oldest block in the API`
        logger.error(loggerTag, message)
        throw new Error(message)
      }
      logger.info(
        loggerTag,
        `inserting first block ${oldestBlockFromAPI.number} from the API...`
      )
      insertBlocks([oldestBlockFromAPI])
      return syncBlocks(Number(oldestBlockFromAPI.number))
    }

    const missingBlocksNumbers = await getMissingBlocksNumbers({
      table,
      start: lastInsertedBlockNumber + 1,
      end:
        lastInsertedBlockNumber + maxBlocksToGet > latestBlockNumber
          ? latestBlockNumber
          : lastInsertedBlockNumber + maxBlocksToGet,
    })

    logger.info(
      loggerTag,
      `missing ${missingBlocksNumbers.length} blocks from ${lastInsertedBlockNumber} to ${latestBlockNumber}`
    )

    for (let i = 0; i < missingBlocksNumbers.length; i += blocksChunkSize) {
      const missingBlocksNumbersChunk = missingBlocksNumbers.slice(
        i,
        i + blocksChunkSize
      )

      logger.info(
        loggerTag,
        `getting missing blocks from ${missingBlocksNumbersChunk[0]} to ${missingBlocksNumbersChunk[missingBlocksNumbersChunk.length - 1]}...`
      )
      // this request sometimes hangs indefinitely, so we need to add a timeout
      const blocksByNumber = await pTimeout(
        getBlocksByNumbers(missingBlocksNumbersChunk, getBlock),
        {
          milliseconds: REQUEST_TIMEOUT,
          fallback: () => {
            throw new TimeoutError(
              'getBlocksByNumbers() timeout after 1 minute'
            )
          },
        }
      )

      logger.info(loggerTag, `inserting ${blocksByNumber.length} blocks...`)
      await insertBlocks(blocksByNumber)
    }

    logger.info(loggerTag, `inserted ${missingBlocksNumbers.length} blocks`)

    if (missingBlocksNumbers.length === maxBlocksToGet) {
      return syncBlocks(missingBlocksNumbers[missingBlocksNumbers.length - 1])
    }

    logger.info(loggerTag, `done syncing blocks`)
  }

  return syncBlocks
}
