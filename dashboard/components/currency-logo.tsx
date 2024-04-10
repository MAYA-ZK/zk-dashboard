import Image from 'next/image'

import type { Currency } from '@zk-dashboard/common/lib/currency'

export function CurrencyLogo({ currency }: { currency: Currency }) {
  return (
    <Image
      src={`${currency === 'usd' ? '/usdc-logo.svg' : '/ethereum-logo.svg'}`}
      alt={`${currency}-logo`}
      width={20}
      height={20}
    />
  )
}
