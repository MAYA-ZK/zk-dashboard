type MethodId = '0xd630280f' | '0xabffac32'

const DECODER_METHOD_PARAMETERS = {
  '0xd630280f': {
    // v1
    METHOD_ID: `0xd630280f`,
    LAST_FINALIZED_TIMESTAMP_INDEX: 2378,
    FINAL_TIMESTAMP_INDEX: 2442,
    FINAL_BLOCK_NUMBER_INDEX: 2314,
    ENCODED_DATA_LENGTH: 64,
  },
  '0xabffac32': {
    // v2 starting 4.6.2024
    METHOD_ID: `0xabffac32`,
    LAST_FINALIZED_TIMESTAMP_INDEX: 2634,
    FINAL_TIMESTAMP_INDEX: 2698,
    FINAL_BLOCK_NUMBER_INDEX: 2250,
    ENCODED_DATA_LENGTH: 64,
  },
} satisfies Record<
  MethodId,
  {
    METHOD_ID: string
    LAST_FINALIZED_TIMESTAMP_INDEX: number
    FINAL_TIMESTAMP_INDEX: number
    FINAL_BLOCK_NUMBER_INDEX: number
    ENCODED_DATA_LENGTH: number
  }
>

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
export function decodeLineaTransactionInputDataByMethod(
  inputData: string,
  methodId: MethodId
) {
  const {
    LAST_FINALIZED_TIMESTAMP_INDEX,
    ENCODED_DATA_LENGTH,
    FINAL_BLOCK_NUMBER_INDEX,
    FINAL_TIMESTAMP_INDEX,
  } = DECODER_METHOD_PARAMETERS[methodId]

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
  decodedData: ReturnType<typeof decodeLineaTransactionInputDataByMethod>
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

export function decodeLineaTransactionInputData(
  input: string,
  methodId: string
) {
  if (Object.keys(DECODER_METHOD_PARAMETERS).includes(methodId)) {
    return formatDecodedTransactionLineaData(
      decodeLineaTransactionInputDataByMethod(input, methodId as MethodId)
    )
  }

  return null
}
