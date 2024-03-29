'use client'

import { MenuIconDynamic } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { BLOCKCHAIN_LINKS, GENERAL_LINKS } from '@/config/navigation'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'
import { useScrollLock } from '@/lib/hooks/use-scroll-lock'
import { cn } from '@/lib/utils'
import MayaLogo from '@/public/maya-primary-logo.svg'
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

  const blockchainLinks = BLOCKCHAIN_LINKS.map((item, index: number) => (
    <NavLink key={index} href={item.path}>
      {item.title}
    </NavLink>
  ))

  const generalLinks = GENERAL_LINKS.map((item, index: number) => (
    <NavLink key={index} className="underline" href={item.path}>
      {item.title}
    </NavLink>
  ))

  const links = [...blockchainLinks, ...generalLinks]

  return (
    <Collapsible>
      <nav className="fixed left-0 top-0 z-10 flex h-18 w-full justify-center bg-muted px-6">
        <CollapsibleContent className="CollapsibleContent absolute left-0 top-0 size-full h-screen md:hidden">
          <div className="flex size-full flex-col gap-4 bg-primary px-8 pt-24">
            {links}
          </div>
        </CollapsibleContent>
        <div className="z-10 flex h-18 w-full max-w-screen-2xl items-center justify-between">
          <Link href={routes.home} className="flex items-center gap-2">
            <MayaLogo className="h-full w-18 bg-black text-muted" />
            <p className="text-2xl tracking-widest">Dashboard</p>
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
          <Menubar className="hidden border-0 bg-transparent md:flex">
            <MenubarMenu>
              <MenubarTrigger className="bg-transparent hover:cursor-pointer hover:bg-accent">
                Select Blockchain
              </MenubarTrigger>
              <MenubarContent>
                {blockchainLinks.map((link) => (
                  <MenubarItem key={link.key}>{link}</MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            <div className="items-center text-sm font-medium ">
              {generalLinks}
            </div>
          </Menubar>
        </div>
      </nav>
    </Collapsible>
  )
}
