import { type ReactNode } from 'react'

export default async function Layout({
  children,
  dailyAvg,
  batchesCosts,
  batchesAvgCost,
  batchesFinality,
}: {
  children: ReactNode
  dailyAvg: ReactNode
  batchesCosts: ReactNode
  batchesAvgCost: ReactNode
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
      {dailyAvg}
      {batchesAvgCost}
      {batchesCosts}
      {batchesFinality}
    </main>
  )
}
