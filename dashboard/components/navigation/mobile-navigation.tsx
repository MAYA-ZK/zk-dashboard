import { DocumentationNav } from '@/app/(dashboard)/documentation/_components/documentation-nav'
import { BlockchainsNav } from '@/components/navigation/blockchains-nav'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'
import MobileIconSvg from '@/public/mobile-icon.svg'
import MobileXIconSvg from '@/public/x-icon.svg'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'

import type { NavigationLinkProps } from './navigation-link'

export function MobileNavigation({
  header,
  links,
}: {
  header: ReactNode
  links: Array<FC<NavigationLinkProps>>
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const shouldDisplay = !useMatchPath(routes.home)

  if (!shouldDisplay) {
    return null
  }

  const onOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <Drawer direction="top" open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger>
        <MobileIconSvg className="size-5" />
      </DrawerTrigger>
      <DrawerContent className="bg-primary">
        <DrawerHeader className="flex items-center justify-between px-6 py-0">
          {header}

          <div onClick={() => onOpenChange(false)}>
            <MobileXIconSvg className="size-5 hover:cursor-pointer" />
          </div>
        </DrawerHeader>

        <div className="flex flex-col px-6 pt-12 text-xl">
          <BlockchainsNav
            activeColor="text-white"
            className="w-full text-xl"
            drawerOnOpenChange={onOpenChange}
          />
          <DocumentationNav />

          <div className="flex flex-col gap-y-2 pt-12">
            {links.map((LinkComponent, index) => (
              <LinkComponent key={index} onOpenChange={onOpenChange} />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
