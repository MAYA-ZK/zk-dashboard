import { BlockchainsNav } from '@/components/blockchains-nav'
import type { ReactNode } from 'react'

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-full grow flex-col gap-5 pb-4">
      <div className="flex gap-5">
        <BlockchainsNav />
        {children}
      </div>
    </main>
  )
}
