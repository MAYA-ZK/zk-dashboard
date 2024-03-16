'use client'

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
import React from 'react'

import { MenuIconDynamic } from '../icons'
import { Logo } from '../logo'
import { ThemeSwitcher } from '../theme-switcher'

const blockchains = [
  {
    name: 'Scroll',
  },
  {
    name: 'zkSync Era',
  },
  {
    name: 'Polygon zkEVM',
  },
]

export default function MayaNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false)

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
          <Logo
            id="mayaPrimary"
            className="h-[34px] w-[116px] sm:h-[56px] sm:w-[150px]"
          />
          <p>Dashboard</p>
        </div>
      </NavbarBrand>

      <NavbarContent
        as="div"
        justify="end"
        className="hidden space-x-3 sm:flex"
      >
        {blockchains.map((item, index) => (
          <NavbarItem key={`${item}-${index}`}>
            <Link href="/">{item.name}</Link>
          </NavbarItem>
        ))}
        <NavbarItem>
          <Link href={routes.maya.home} className="underline">
            {routes.maya.title}
          </Link>
        </NavbarItem>
        <ThemeSwitcher />
      </NavbarContent>

      <NavbarMenuToggle
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className="sm:hidden"
        icon=<MenuIconDynamic isMenuOpen={isMenuOpen} />
      />

      <NavbarMenu className="bg-primary">
        {blockchains.map((item, index) => (
          <NavbarItem key={`${item}-${index}`}>
            <Link href="/">{item.name}</Link>
          </NavbarItem>
        ))}
        <NavbarItem>
          <Link href={routes.maya.home} className="underline">
            {routes.maya.title}
          </Link>
        </NavbarItem>
        <ThemeSwitcher />
      </NavbarMenu>
    </Navbar>
  )
}
