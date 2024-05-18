export const LINEA_TRANSACTION_INPUT_DATA_METHOD_ID = `0xd630280f`
const LAST_FINALIZED_TIMESTAMP_INDEX = 2378
const FINAL_TIMESTAMP_INDEX = 2442
const FINAL_BLOCK_NUMBER_INDEX = 2314
const ENCODED_DATA_LENGTH = 64

function decodeNumericInputData(
  inputData: string,
  index: number,
  length: number
) {
  return parseInt(inputData.slice(index, index + length), 16)
}

/**
 * Decodes input data for Linea transaction with method ID `0xd630280f`
 */
export function decodeLineaTransactionInputData(inputData: string) {
  const lastFinalizedTimestamp = decodeNumericInputData(
    inputData,
    LAST_FINALIZED_TIMESTAMP_INDEX,
    ENCODED_DATA_LENGTH
  )
  const finalTimestamp = decodeNumericInputData(
    inputData,
    FINAL_TIMESTAMP_INDEX,
    ENCODED_DATA_LENGTH
  )
  const finalBlockNumber = decodeNumericInputData(
    inputData,
    FINAL_BLOCK_NUMBER_INDEX,
    ENCODED_DATA_LENGTH
  )

  return {
    lastFinalizedTimestamp,
    finalTimestamp,
    finalBlockNumber,
  }
}

export function formatDecodedTransactionLineaData(
  decodedData: ReturnType<typeof decodeLineaTransactionInputData>
) {
  const lastFinalizedTimestamp = new Date(
    decodedData.lastFinalizedTimestamp * 1000
  )
  const finalTimestamp = new Date(decodedData.finalTimestamp * 1000)
  const finalBlockNumber = BigInt(decodedData.finalBlockNumber)

  return {
    finalBlockNumber,
    lastFinalizedTimestamp,
    finalTimestamp,
  }
}
