import { GENERAL_LINKS } from '@/config/navigation'
import { useMatchPath } from '@/lib/hooks/match-path'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ComponentProps } from 'react'

export function NavLink({
  href,
  className,
  ...props
}: ComponentProps<typeof Link>) {
  const path = typeof href === 'string' ? href : href.pathname
  const isLinkActive = useMatchPath(path ?? null)

  return (
    <Link
      href={href}
      className={cn(
        'text-primary-foreground',
        {
          'text-muted  md:text-primary': isLinkActive,
        },
        className
      )}
      {...props}
    />
  )
}

export interface NavigationLinkProps {
  onOpenChange?: (open: boolean) => void
}

export function BackToDashboardLink({ onOpenChange }: NavigationLinkProps) {
  const path = GENERAL_LINKS.backToDashboard.path
  const title = GENERAL_LINKS.backToDashboard.title
  const shouldDisplay = !useMatchPath(path)

  if (!shouldDisplay) {
    return null
  }

  return (
    <NavLink href={path} className="flex items-center gap-x-2 hover:underline">
      {onOpenChange ? (
        <button onClick={() => onOpenChange(false)}>{title}</button>
      ) : (
        title
      )}
    </NavLink>
  )
}
