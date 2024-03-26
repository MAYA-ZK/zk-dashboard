'use client'

import { MenuIconDynamic } from '@/components/icons'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { NAV_CONFIG } from '@/config/navigation'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'
import { useScrollLock } from '@/lib/hooks/use-scroll-lock'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import { useState } from 'react'

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
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  useScrollLock({
    autoLock: isMenuOpen,
    lockTarget: 'body',
  })

  const links = NAV_CONFIG.map((item, index: number) => (
    <NavLink
      key={index}
      className={cn({
        underline: item.path === routes.maya,
      })}
      href={item.path}
    >
      {item.title}
    </NavLink>
  ))
  return (
    <Collapsible>
      <nav className="fixed left-0 top-0 z-10 flex h-16 w-full justify-center bg-muted px-6">
        <CollapsibleContent className="CollapsibleContent absolute left-0 top-0 size-full h-screen md:hidden">
          <div className="flex size-full flex-col gap-4 bg-primary px-8 pt-16">
            {links}
          </div>
        </CollapsibleContent>
        <div className="z-10 flex h-16 w-full max-w-screen-2xl items-center justify-between">
          <Link href={routes.home} className="flex items-center gap-2">
            <Logo
              id="mayaPrimary"
              className="h-[34px] w-[116px] sm:h-[56px] sm:w-[150px]"
            />
            <p>Dashboard</p>
          </Link>
          <CollapsibleTrigger className="md:hidden" asChild>
            <Button
              variant="ghost"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={isMenuOpen ? 'bg-primary' : 'bg-muted'}
            >
              <MenuIconDynamic isMenuOpen={isMenuOpen} />
            </Button>
          </CollapsibleTrigger>
          <div className="hidden items-center gap-4 md:flex">{links}</div>
        </div>
      </nav>
    </Collapsible>
  )
}
