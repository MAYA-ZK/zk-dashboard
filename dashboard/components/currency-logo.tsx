import type { Currency } from '@zk-dashboard/common/lib/currency'
import EthereumLogo from '@zk-dashboard/dashboard/public/ethereum-logo.svg'
import UsdcLogo from '@zk-dashboard/dashboard/public/usdc-logo.svg'

export function CurrencyLogo({ currency }: { currency: Currency }) {
  return currency === 'usd' ? (
    <UsdcLogo width={20} height={20} />
  ) : (
    <EthereumLogo width={20} height={20} />
  )
}
