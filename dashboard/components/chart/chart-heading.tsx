import type { ReactNode } from 'react'

export function ChartHeading({
  children,
  subheading,
}: {
  children: ReactNode
  subheading?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-semibold">{children}</h2>
      <h3 className="text-xs font-semibold uppercase">{subheading}</h3>
    </div>
  )
}
