import BigNumber from 'bignumber.js'

/**
 * Get the transaction fee in wei
 */
export function calculateTransactionFee(
  gasUsed: number | bigint | string,
  effectiveGasPrice: number | bigint | string
) {
  return BigNumber(gasUsed.toString()).multipliedBy(
    BigNumber(effectiveGasPrice.toString())
  )
}
