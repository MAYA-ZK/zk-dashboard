'use client'

import { BLOCKCHAIN_LINKS } from '@/config/navigation'
import { useMatchPath } from '@/lib/hooks/match-path'
import { matchPath } from '@/lib/path'
import { cn } from '@/lib/utils'
import PolygonZkEvmSvg from '@/public/polygon-zk-evm-logo.svg'
import ScrollSvg from '@/public/scroll-logo.svg'
import ZkSyncEraSvg from '@/public/zk-sync-era-logo.svg'
import { usePathname } from 'next/navigation'

import { NavLink } from './navigation-link'

interface BlockchainLink {
  path: string
  title: string
  logo: JSX.Element
}

const navigationConfig = {
  scroll: {
    ...BLOCKCHAIN_LINKS.scroll,
    logo: <ScrollSvg className="size-5" />,
  },
  zkSyncEra: {
    ...BLOCKCHAIN_LINKS.zkSyncEra,
    logo: <ZkSyncEraSvg className="size-5" />,
  },
  polygonZkEVM: {
    ...BLOCKCHAIN_LINKS.polygonZkEVM,
    logo: <PolygonZkEvmSvg className="size-5" />,
  },
}

function BlockchainNavLink({
  blockchain,
  activeColor,
  onOpenChange,
}: {
  blockchain: BlockchainLink
  activeColor?: string
  onOpenChange?: (open: boolean) => void
}) {
  const path = usePathname()

  const isActive = (blockchainPath: string) => {
    return matchPath(path, blockchainPath)
  }

  return (
    <NavLink
      href={blockchain.path}
      className="flex items-center gap-x-2 hover:underline"
    >
      {blockchain.logo}
      {onOpenChange ? (
        <button onClick={() => onOpenChange(false)}>
          <p className={cn(isActive(blockchain.path) && activeColor)}>
            {blockchain.title}
          </p>
        </button>
      ) : (
        blockchain.title
      )}
    </NavLink>
  )
}

export function BlockchainsNav({
  className,
  activeColor,
  drawerOnOpenChange,
}: {
  className?: string
  activeColor?: string
  drawerOnOpenChange?: (open: boolean) => void
}) {
  const shouldDisplay = useMatchPath(
    '/dashboard/(scroll|zksync-era|polygon-zkevm)'
  )

  if (!shouldDisplay) {
    return null
  }

  return (
    <nav
      aria-labelledby="blockchains-navigation-title"
      className={cn('w-40', className)}
    >
      {navigationConfig && (
        <>
          <h2 id="blockchains-navigation" className="font-bold">
            Blockchains
          </h2>
          <ol role="list" className="mt-4 space-y-3 font-medium">
            {Object.values(navigationConfig).map((blockchain) => (
              <li key={blockchain.path}>
                <BlockchainNavLink
                  blockchain={blockchain}
                  onOpenChange={drawerOnOpenChange}
                  activeColor={activeColor}
                />
              </li>
            ))}
          </ol>
        </>
      )}
    </nav>
  )
}
