'use client'

import { BLOCKCHAIN_LINKS } from '@/config/navigation'
import { matchPath } from '@/lib/path'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import { NavLink } from './navigation-link'
import SideNavigation from './side-navigation'

interface BlockchainLink {
  path: string
  title: string
  logo: JSX.Element
}

const navigationConfig = [
  {
    ...BLOCKCHAIN_LINKS.scroll,
    logo: (
      <Image
        src="/scroll-logo.svg"
        alt="scroll-logo"
        width={10}
        height={10}
        className="size-5"
      />
    ),
  },
  {
    ...BLOCKCHAIN_LINKS.zkSyncEra,
    logo: (
      <Image
        src="/zk-sync-era-logo.svg"
        alt="zk-sync-era-logo"
        width={10}
        height={10}
        className="size-5"
      />
    ),
  },
  {
    ...BLOCKCHAIN_LINKS.polygonZkEVM,
    logo: (
      <Image
        src="/polygon-zk-evm-logo.svg"
        alt="polygon-zk-evm-logo"
        width={10}
        height={10}
        className="size-5"
      />
    ),
  },
]

const shouldDisplayRegex = '/dashboard/(scroll|zksync-era|polygon-zkevm)'

function BlockchainNavLink({
  blockchain,
  activeColor,
}: {
  blockchain: BlockchainLink
  activeColor?: string
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
      <p className={cn(isActive(blockchain.path) && activeColor)}>
        {blockchain.title}
      </p>
    </NavLink>
  )
}

export function BlockchainsNav({
  className,
  activeColor,
}: {
  className?: string
  activeColor?: string
}) {
  return (
    <SideNavigation
      shouldDisplayRegex={shouldDisplayRegex}
      className={className}
      contentListChildren={navigationConfig.map((blockchain) => (
        <li key={blockchain.path}>
          <BlockchainNavLink
            blockchain={blockchain}
            activeColor={activeColor}
          />
        </li>
      ))}
    />
  )
}
