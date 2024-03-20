'use client'

import { MenuIconDynamic } from '@/components/icons'
import { Logo } from '@/components/logo'
import { NAV_CONFIG } from '@/config/navigation'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
  cn,
} from '@nextui-org/react'
import Link from 'next/link'
import React, { useState } from 'react'

type NavConfigType = (typeof NAV_CONFIG)[0]

function NavLink({ item, ...props }: { item: NavConfigType }) {
  const isLinkActive = useMatchPath(item.path)

  return (
    <NavbarItem key={props.key}>
      <Link
        href={item.path}
        className={cn(
          'text-black',
          isLinkActive && 'text-maya-warm-white sm:text-primary',
          item.path === routes.maya && 'underline'
        )}
      >
        {item.title}
      </Link>
    </NavbarItem>
  )
}

export function MayaNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  return (
    <Navbar
      maxWidth="full"
      className={cn(
        'px-1 transition-colors duration-500 ease-in-out md:px-5',
        isMenuOpen ? 'bg-primary' : 'bg-background'
      )}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      shouldHideOnScroll
    >
      <NavbarBrand>
        <div className="flex items-center space-x-2">
          <Link href={routes.home}>
            <Logo
              id="mayaPrimary"
              className="h-[34px] w-[116px] sm:h-[56px] sm:w-[150px]"
            />
          </Link>
          <p>Dashboard</p>
        </div>
      </NavbarBrand>

      <NavbarContent
        as="div"
        justify="end"
        className="hidden space-x-3 sm:flex"
      >
        {NAV_CONFIG.map((item, index: number) => (
          <NavLink key={`${item.title}-${index}`} item={item} />
        ))}

        {/* TODO: Disabled - re-enable when dark mode assets/colors are finalized */}
        {/* <ThemeSwitcher /> */}
      </NavbarContent>

      <NavbarMenuToggle
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className="sm:hidden"
        icon=<MenuIconDynamic isMenuOpen={isMenuOpen} />
      />

      <NavbarMenu className="bg-primary">
        {NAV_CONFIG.map((item, index) => (
          <NavLink key={`${item.title}-${index}`} item={item} />
        ))}
        {/* TODO: Disabled - re-enable when dark mode assets/colors are finalized */}
        {/* <ThemeSwitcher /> */}
      </NavbarMenu>
    </Navbar>
  )
}
