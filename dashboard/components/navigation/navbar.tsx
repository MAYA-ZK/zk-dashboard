'use client'

import { MobileNavigation } from '@/components/navigation/mobile-navigation'
import { GENERAL_LINKS } from '@/config/navigation'
import { routes } from '@/config/routes'
import MayaLogo from '@/public/maya-primary-logo.svg'
import Link from 'next/link'
import { Suspense } from 'react'

import { HideOnActiveNavLink } from './navigation-link'

const NAVIGATION_LINKS_CONFIG = [
  {
    path: GENERAL_LINKS.documentation.path,
    title: GENERAL_LINKS.documentation.title,
  },
  {
    path: GENERAL_LINKS.backToDashboard.path,
    title: GENERAL_LINKS.backToDashboard.title,
  },
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
  const links = NAVIGATION_LINKS_CONFIG.map((link, index) => (
    <HideOnActiveNavLink key={index} {...link} />
  ))

  return (
    <nav className="fixed left-0 top-0 z-20 flex h-18 w-full justify-center bg-muted px-6">
      <div className="z-10 flex h-18 w-full max-w-screen-2xl items-center justify-between">
        <NavHeader />
        <div className="hidden md:flex md:gap-x-6">{links}</div>

        <div className="block md:hidden">
          <Suspense>
            <MobileNavigation header={<NavHeader />} links={links} />
          </Suspense>
        </div>
      </div>
    </nav>
  )
}
