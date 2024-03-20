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
    <main className="flex h-full grow flex-col items-center gap-8 p-5 md:p-10">
      <div className="py-6 text-center">
        <h2>Polygon zkEVM</h2>
        <p>Polygone zkEVM description</p>
      </div>
      {children}
      {dailyAvg}
      {batchesAvgCost}
      {batchesCosts}
      {batchesFinality}
    </main>
  )
}
