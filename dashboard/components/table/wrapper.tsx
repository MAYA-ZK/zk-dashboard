import type { ReactNode } from 'react'

export function TableWrapper({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-sm w-full flex-col gap-6 rounded-md bg-background px-5 py-3">
      <h2 className="p-2 text-2xl font-semibold">{heading}</h2>
      {children}
    </div>
  )
}
