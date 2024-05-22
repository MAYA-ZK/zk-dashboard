import Image from 'next/image'

import type { Currency } from '@zk-dashboard/common/lib/currency'

export function CurrencyLogo({ currency }: { currency: Currency }) {
  return (
    <div className="flex size-6 flex-none items-center justify-center rounded-full bg-primary">
      <Image
        src={`${currency === 'usd' ? '/usd-logo.svg' : '/ethereum-logo.svg'}`}
        alt={`${currency}-logo`}
        width={20}
        height={20}
        className="size-auto"
      />
    </div>
  )
}
