import { DocumentationNav } from '@/app/(dashboard)/documentation/_components/documentation-nav'
import { BlockchainsNav } from '@/components/navigation/blockchains-nav'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Menu, X } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

export function MobileNavigation({
  header,
  links,
}: {
  header: ReactNode
  links: Array<ReactNode>
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

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

          <div className="flex flex-col gap-y-2 pt-12">{links}</div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
