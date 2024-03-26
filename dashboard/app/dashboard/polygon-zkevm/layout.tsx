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
        <h1 className="text-4xl font-semibold">Polygon zkEVM</h1>
        <p className="max-w-lg text-center font-light">
          Polygon zkEVM is the leading ZK scaling solution that is equivalent to
          Ethereum Virtual Machine: The vast majority of existing smart
          contracts, developer tools and wallets work seamlessly.
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
