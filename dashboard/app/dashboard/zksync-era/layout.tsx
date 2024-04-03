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
        <p className="max-w-lg text-center font-light">
          zkSync Era is a layer 2 rollup that uses zero-knowledge proofs to
          scale Ethereum without compromising on security or decentralization
        </p>
      </div>
      {children}
      {dailyBatches}
      {dailyCost}
      {batchesCosts}
      {batchesFinality}
    </main>
  )
}
