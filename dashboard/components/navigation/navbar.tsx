'use client'

import { MobileNavigation } from '@/components/navigation/mobile-navigation'
import { routes } from '@/config/routes'
import MayaLogo from '@/public/maya-primary-logo.svg'
import Link from 'next/link'
import type { FC } from 'react'

import type { NavigationLinkProps } from './navigation-link'
import { BackToDashboardLink } from './navigation-link'

const NavigationLinkComponents: Array<FC<NavigationLinkProps>> = [
  BackToDashboardLink,
]

function NavHeader() {
  return (
    <div className="flex items-center gap-2">
      <Link href={routes.maya}>
        <MayaLogo className="h-full w-18 bg-black text-muted" />
      </Link>
      <Link href={routes.home}>
        <p className="text-2xl tracking-widest">DASHBOARD</p>
      </Link>
    </div>
  )
}

export function Navbar() {
  return (
    <nav className="fixed left-0 top-0 z-20 flex h-18 w-full justify-center bg-muted px-6">
      <div className="z-10 flex h-18 w-full max-w-screen-2xl items-center justify-between">
        <NavHeader />
        <div className="hidden md:block">
          {NavigationLinkComponents.map((LinkComponent, index) => (
            <LinkComponent key={index} />
          ))}
        </div>

        <div className="block md:hidden">
          <MobileNavigation
            header={<NavHeader />}
            links={NavigationLinkComponents}
          />
        </div>
      </div>
    </nav>
  )
}
