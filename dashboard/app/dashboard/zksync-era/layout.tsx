import { type ReactNode } from 'react'

export default async function Layout({
  children,
  dailyBatches,
  batchesCosts,
  dailyCost,
  batchesFinality,
}: {
  children: ReactNode
  dailyBatches: ReactNode
  batchesCosts: ReactNode
  dailyCost: ReactNode
  batchesFinality: ReactNode
}) {
  return (
    <main className="flex h-full grow flex-col gap-5 pb-4">
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <h1 className="text-4xl font-semibold">zkSync Era</h1>
      </div>
      {children}
      {dailyBatches}
      {dailyCost}
      {batchesCosts}
      {batchesFinality}
    </main>
  )
}
