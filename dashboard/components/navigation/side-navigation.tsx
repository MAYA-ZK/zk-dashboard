import { useMatchPath } from '@/lib/hooks/match-path'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export default function SideNavigation({
  className,
  shouldDisplayRegex,
  contentListChildren,
}: {
  className?: string
  shouldDisplayRegex: string
  contentListChildren: ReactNode
}) {
  const shouldDisplay = useMatchPath(shouldDisplayRegex)

  if (!shouldDisplay) {
    return null
  }

  return (
    <nav className={cn('w-40', className)}>
      <>
        <ol role="list" className="mt-4 space-y-3 font-medium">
          {contentListChildren}
        </ol>
      </>
    </nav>
  )
}
