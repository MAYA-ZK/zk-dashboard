import { type ReactNode } from 'react'

export default async function Layout({
  children,
  dailyBatches,
  dailyCost,
}: {
  children: ReactNode
  dailyBatches: ReactNode
  dailyCost: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="py-6 text-center">
        <h1 className="text-4xl font-semibold">Linea</h1>
      </div>
      {children}
      {dailyBatches}
      {dailyCost}
    </div>
  )
}
