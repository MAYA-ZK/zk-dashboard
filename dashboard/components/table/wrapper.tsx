import type { ReactNode } from 'react'

export function TableWrapper({
  heading,
  children,
  rightControls,
  subheading,
}: {
  heading: string
  children: ReactNode
  rightControls?: ReactNode
  subheading?: string
}) {
  return (
    <div className="flex min-h-sm w-full flex-col gap-6 rounded-md bg-background px-5 py-3">
      <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
        <div className="flex flex-col gap-2 p-2">
          <h2 className="text-2xl font-semibold">{heading}</h2>
          {subheading && <h3>{subheading}</h3>}
        </div>
        <div className="pt-3">{rightControls}</div>
      </div>
      {children}
    </div>
  )
}
