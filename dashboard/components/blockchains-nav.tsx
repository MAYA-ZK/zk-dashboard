'use client'

import { routes } from '@/config/routes'
import { matchPath } from '@/lib/path'
import { cn } from '@/lib/utils'
import PolygonZkEvmSvg from '@/public/polygon-zk-evm-logo.svg'
import ScrollSvg from '@/public/scroll-logo.svg'
import ZkSyncEraSvg from '@/public/zk-sync-era-logo.svg'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationConfig = {
  scroll: {
    title: 'Scroll',
    logo: <ScrollSvg className="size-5" />,
    path: routes.scroll,
  },
  zkSyncEra: {
    title: 'zkSync Era',
    logo: <ZkSyncEraSvg className="size-5" />,
    path: routes.zkSync,
  },
  polygonZkEVM: {
    title: 'Polygon zkEVM',
    logo: <PolygonZkEvmSvg className="size-5" />,
    path: routes.polygon,
  },
}

export function BlockchainsNav() {
  const path = usePathname()

  const isActive = (blockchainPath: string) => {
    return matchPath(path, blockchainPath)
  }

  return (
    <div className="hidden lg:sticky lg:top-[7.75rem] lg:block lg:h-fit lg:flex-none lg:overflow-y-auto lg:py-16 lg:pr-6 ">
      <nav aria-labelledby="blockchains-navigation-title" className="w-40">
        {navigationConfig && (
          <>
            <h2 id="blockchains-navigation" className="text-sm font-bold">
              Blockchains
            </h2>
            <ol role="list" className="mt-4 space-y-3 text-sm font-medium">
              {Object.values(navigationConfig).map((blockchain) => (
                <li key={blockchain.path}>
                  <div className="flex items-center gap-2">
                    {blockchain.logo}

                    <h3>
                      <Link
                        href={blockchain.path}
                        className={cn(
                          isActive(blockchain.path)
                            ? 'text-primary'
                            : 'hover:underline'
                        )}
                      >
                        {blockchain.title}
                      </Link>
                    </h3>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </nav>
    </div>
  )
}
