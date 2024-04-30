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
    <div className="">
      <div className="py-6 text-center">
        <h1 className="text-4xl font-semibold">zkSync Era</h1>
      </div>
      {children}
      {dailyBatches}
      {dailyCost}
      {batchesCosts}
      {batchesFinality}
    </div>
  )
}
