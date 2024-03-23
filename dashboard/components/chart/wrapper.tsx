import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export function ChartWrapper({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex size-full max-h-[500px] min-h-[500px] flex-col rounded-md bg-background',
        className
      )}
      {...props}
    />
  )
}
