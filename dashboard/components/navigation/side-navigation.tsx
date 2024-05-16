import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export default function SideNavigation({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <nav className={cn('w-40', className)}>
      <ul role="list" className="mt-4 space-y-3 font-medium">
        {children}
      </ul>
    </nav>
  )
}
