import { Logo } from '@/components/logo'
import { type ReactNode } from 'react'

export default async function Home({
  dailyTransactions,
  transactionsPerSecond,
  averageTXCost,
  batchCommitsPerSecond,
  avgBlockSize,
  avgBlockTime,
  gasUsagePerDay,
  table,
}: {
  dailyTransactions: ReactNode
  transactionsPerSecond: ReactNode
  averageTXCost: ReactNode
  batchCommitsPerSecond: ReactNode
  avgBlockSize: ReactNode
  avgBlockTime: ReactNode
  gasUsagePerDay: ReactNode
  table: ReactNode
}) {
  return (
    <main className="flex h-full grow items-center p-5 md:p-10">
      <section className="flex size-full flex-col items-center gap-10">
        <>
          <div className="flex items-center">
            <Logo className="w-40" id="scrollBlockchain" />
          </div>
          <div className="flex w-full grow items-center">
            <div className="grid w-full auto-rows-[28rem] grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="size-full">{dailyTransactions}</div>
              <div className="size-full">{batchCommitsPerSecond}</div>
              <div className="size-full">{averageTXCost}</div>
              <div className="size-full">{transactionsPerSecond}</div>
              <div className="size-full">{avgBlockSize}</div>
              <div className="size-full">{avgBlockTime}</div>
              <div className="size-full">{gasUsagePerDay}</div>
              <div className="size-full">{table}</div>
            </div>
          </div>
        </>
      </section>
    </main>
  )
}
