'use client'

import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'
import { cn } from '@/lib/utils'
import MayaLogo from '@/public/maya-primary-logo.svg'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import type { ComponentProps } from 'react'

function NavLink({ href, className, ...props }: ComponentProps<typeof Link>) {
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

function BackToDashboardLink() {
  const shouldDisplay = !useMatchPath(routes.home)

  if (!shouldDisplay) {
    return null
  }

  return (
    <NavLink
      href={routes.home}
      className="flex items-center gap-x-2 hover:underline"
    >
      <ChevronLeft width={18} height={18} />
      Back to main page
    </NavLink>
  )
}

export function Navbar() {
  return (
    <nav className="fixed left-0 top-0 z-10 flex h-18 w-full justify-center bg-muted px-6">
      <div className="z-10 flex h-18 w-full max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={routes.maya}>
            <MayaLogo className="h-full w-18 bg-black text-muted" />
          </Link>
          <Link href={routes.home}>
            <p className="text-2xl tracking-widest">DASHBOARD</p>
          </Link>
        </div>
        <BackToDashboardLink />
      </div>
    </nav>
  )
}
