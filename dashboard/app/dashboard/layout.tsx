import { type ReactNode } from 'react'

export default async function Layout({
  children,
  scrollDailyAvg,
  scrollBatchesCosts,
  scrollBatchesAvgCost,
}: {
  children: ReactNode
  scrollDailyAvg: ReactNode
  scrollBatchesCosts: ReactNode
  scrollBatchesAvgCost: ReactNode
}) {
  return (
    <main className="flex h-full grow flex-col items-center gap-8 p-5 md:p-10">
      {children}
      {scrollDailyAvg}
      {scrollBatchesAvgCost}
      {scrollBatchesCosts}
    </main>
  )
}
