'use client'

import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'
import { cn } from '@/lib/utils'
import MayaLogo from '@/public/maya-primary-logo.svg'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

export function Navbar() {
  const path = usePathname()

  const BackToDashboardLink = (
    <NavLink href="/">
      <div className="flex items-center gap-x-2 hover:underline">
        <ChevronLeft width={18} height={18} />
        Back to main page
      </div>
    </NavLink>
  )

  return (
    <nav className="fixed left-0 top-0 z-10 flex h-18 w-full justify-center bg-muted px-6">
      <div className="z-10 flex h-18 w-full max-w-screen-2xl items-center justify-between">
        <Link href={routes.maya} className="flex items-center gap-2">
          <MayaLogo className="h-full w-18 bg-black text-muted" />
          <p className="text-2xl tracking-widest">Dashboard</p>
        </Link>
        {path !== '/' && BackToDashboardLink}
      </div>
    </nav>
  )
}
