'use client'

import { MenuIconDynamic } from '@/components/icons'
import { Logo } from '@/components/logo'
import { NAV_CONFIG } from '@/config/navigation'
import { routes } from '@/config/routes'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
} from '@nextui-org/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useState } from 'react'

export function MayaNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const path = usePathname()

  const isLinkActive = useCallback(
    (linkPath: string) => {
      return path === linkPath
    },
    [path]
  )

  return (
    <Navbar
      maxWidth="full"
      className={`transition-colors duration-500 ease-in-out ${isMenuOpen ? 'bg-primary' : 'bg-background'} px-1 md:px-5`}
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
          <NavbarItem key={`${item.title}-${index}`}>
            <Link
              href={item.path}
              className={`${index === NAV_CONFIG.length - 1 ? 'underline' : ''} ${isLinkActive(item.path) ? 'text-primary' : 'text-black'}`}
            >
              {item.title}
            </Link>
          </NavbarItem>
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
          <NavbarItem key={`${item.title}-${index}`}>
            <Link
              href={item.path}
              className={`${index === NAV_CONFIG.length - 1 ? 'underline' : ''} ${isLinkActive(item.path) ? 'text-primary' : 'text-black'}`}
            >
              {item.title}
            </Link>
          </NavbarItem>
        ))}
        {/* TODO: Disabled - re-enable when dark mode assets/colors are finalized */}
        {/* <ThemeSwitcher /> */}
      </NavbarMenu>
    </Navbar>
  )
}
