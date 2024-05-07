import { DocumentationNav } from '@/app/(dashboard)/documentation/_components/documentation-nav'
import { BlockchainsNav } from '@/components/navigation/blockchains-nav'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'
import { Menu, X } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { FC, ReactNode } from 'react'
import { useEffect, useState } from 'react'

import type { NavigationLinkProps } from './navigation-link'

export function MobileNavigation({
  header,
  links,
}: {
  header: ReactNode
  links: Array<FC<NavigationLinkProps>>
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const shouldDisplay = !useMatchPath(routes.home)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  if (!shouldDisplay) {
    return null
  }

  const onOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <Drawer direction="top" open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger>
        <Menu className="size-5" />
      </DrawerTrigger>
      <DrawerContent className="bg-primary">
        <DrawerHeader className="flex items-center justify-between px-6 py-0">
          {header}

          <DrawerClose>
            <X className="size-5 hover:cursor-pointer" />
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-col px-6 pt-12 text-xl">
          <BlockchainsNav activeColor="text-white" className="w-full text-xl" />
          <DocumentationNav />

          <div className="flex flex-col gap-y-2 pt-12">
            {links.map((LinkComponent, index) => (
              <LinkComponent key={index} />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
