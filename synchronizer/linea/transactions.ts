import { desc } from 'drizzle-orm'

import type { LineaTransaction } from '@zk-dashboard/common/database/schema'
import { lineaTransactions } from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'
import { etherscan } from '@zk-dashboard/common/integrations/ethereum/etherscan'
import { logger } from '@zk-dashboard/common/lib/logger'

import { MAX_DATA_AGE_IN_DAYS } from '../common/constants'
import { searchOldestEntity } from '../common/search'
import { LOGGER_CONFIG } from './constants'
import {
  LINEA_TRANSACTION_INPUT_DATA_METHOD_ID,
  decodeLineaTransactionInputData,
  formatDecodedTransactionLineaData,
} from './decoder'

const ENTITY_NUMBER_SPAN = 100
const LOGGER_TAG = {
  id: LOGGER_CONFIG.id,
  category: LOGGER_CONFIG.category.transactions,
}
const TRANSACTIONS_PER_PAGE = 50

const LINEA_ACCOUNT_ADDRESS = '0xd19d4B5d358258f05D7B411E21A1460D11B0876F'

async function getEntity(blockNum: number) {
  const blockTransactions = await etherscan.getAccountTransactions({
    queries: {
      address: LINEA_ACCOUNT_ADDRESS,
      page: 1,
      offset: 10,
      sort: 'desc',
      endblock: blockNum,
      startblock: blockNum - 120,
    },
  })

  const firstTransaction = blockTransactions[0]

  if (!firstTransaction) {
    throw new Error('could not get the first transaction from the API')
  }

  return {
    number: Number(firstTransaction.blockNumber),
    timestamp: firstTransaction.timeStamp,
  }
}

async function getOldestTransactionBlockNumber() {
  const latestTransaction = await etherscan.getAccountLatestTransaction(
    LINEA_ACCOUNT_ADDRESS
  )

  const latestTransactionNormalized = {
    number: Number(latestTransaction.blockNumber),
    timestamp: latestTransaction.timeStamp,
  }

  return await searchOldestEntity({
    probablyOldestEntity: latestTransactionNormalized,
    latestEntity: latestTransactionNormalized,
    getEntity: getEntity,
    entityName: 'transaction',
    entityNumberSpan: ENTITY_NUMBER_SPAN,
    loggerTag: LOGGER_TAG,
    maxDataAgeInDays: MAX_DATA_AGE_IN_DAYS,
  })
}

export async function syncTransactions() {
  logger.info(LOGGER_TAG, 'Starting synchronization of linea transactions...')

  let startBlock = 0

  const latestDBTransactions = await db
    .select()
    .from(lineaTransactions)
    .orderBy(desc(lineaTransactions.block_number))
    .limit(TRANSACTIONS_PER_PAGE)

  if (latestDBTransactions.length === 0) {
    logger.info(
      LOGGER_TAG,
      'No transactions in the database. Looking for the oldest transaction in the blockchain...'
    )
    const oldestTransactionBlockNumber = await getOldestTransactionBlockNumber()
    logger.info(
      LOGGER_TAG,
      `Setting start block from the oldest transaction in the blockchain: ${oldestTransactionBlockNumber.number}`
    )
    startBlock = oldestTransactionBlockNumber.number
  }

  const latestDBTransaction = latestDBTransactions[0]

  if (latestDBTransaction) {
    logger.info(
      LOGGER_TAG,
      'Setting start block from the latest transaction in the database'
    )
    startBlock = Number(latestDBTransaction.block_number)
  }

  let prevTransactions: Array<Omit<LineaTransaction, 'id'>> =
    latestDBTransactions
  let page = 1

  while (prevTransactions.length > 0 || latestDBTransactions.length === 0) {
    logger.info(
      LOGGER_TAG,
      `Fetching transactions from page ${page}... start block: ${startBlock}`
    )
    const transactions = await etherscan.getAccountTransactions({
      queries: {
        address: LINEA_ACCOUNT_ADDRESS,
        page: page,
        offset: TRANSACTIONS_PER_PAGE,
        sort: 'asc',
        startblock: startBlock,
        endblock: 99999999,
      },
    })

    const transactionsForDBInsert = transactions
      .filter((transaction) => {
        return !prevTransactions.some((prevTransaction) => {
          return prevTransaction.hash === transaction.hash
        })
      })
      .map((transaction) => {
        const decodedData =
          transaction.methodId === LINEA_TRANSACTION_INPUT_DATA_METHOD_ID
            ? formatDecodedTransactionLineaData(
                decodeLineaTransactionInputData(transaction.input)
              )
            : null

        return {
          hash: transaction.hash,
          from: transaction.from,
          to: transaction.to,
          value: transaction.value.toString(),
          gas: transaction.gas,
          input: transaction.input,
          method_id: transaction.methodId,
          nonce: transaction.nonce,
          block_hash: transaction.blockHash,
          block_number: transaction.blockNumber,
          function_name: transaction.functionName,
          contract_address: transaction.contractAddress,
          gas_price: transaction.gasPrice,
          cumulative_gas_used: transaction.cumulativeGasUsed,
          gas_used: transaction.gasUsed,
          timestamp: transaction.timeStamp,
          transaction_index: transaction.transactionIndex,
          confirmations: transaction.confirmations,
          tx_receipt_status: transaction.txreceipt_status,
          decoded_last_finalized_timestamp:
            decodedData?.lastFinalizedTimestamp ?? null,
          decoded_final_timestamp: decodedData?.finalTimestamp ?? null,
          decoded_final_block_number: decodedData?.finalBlockNumber ?? null,
        }
      })

    logger.info(
      LOGGER_TAG,
      `Inserting ${transactionsForDBInsert.length} transactions...`
    )

    if (transactionsForDBInsert.length === 0) {
      break
    }

    await db
      .insert(lineaTransactions)
      .values(transactionsForDBInsert)
      .onConflictDoNothing()

    prevTransactions = transactionsForDBInsert

    if (page >= 100) {
      const lastTransaction =
        transactionsForDBInsert[transactionsForDBInsert.length - 1]
      if (lastTransaction) {
        startBlock = Number(lastTransaction.block_number)
        page = 1
        continue
      }
    }

    page += 1
  }

  logger.info(LOGGER_TAG, 'Synchronization of linea transactions finished.')
}
