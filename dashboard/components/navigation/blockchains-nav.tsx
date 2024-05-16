'use client'

import { BLOCKCHAIN_LINKS } from '@/config/navigation'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'
import Image from 'next/image'

import { NavLink } from './navigation-link'
import SideNavigation from './side-navigation'

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

const IS_MATCH_PATHS = [routes.scroll, routes.polygon, routes.zkSync]

export function BlockchainsNav({
  className,
  activeColor,
}: {
  className?: string
  activeColor?: string
}) {
  const isMatch = useMatchPath(IS_MATCH_PATHS)

  if (!isMatch) {
    return null
  }

  return (
    <SideNavigation className={className}>
      {navigationConfig.map((blockchain) => (
        <li key={blockchain.path}>
          <NavLink
            href={blockchain.path}
            variant="blockchain"
            activeColor={activeColor}
          >
            {blockchain.logo}
            <p>{blockchain.title}</p>
          </NavLink>
        </li>
      ))}
    </SideNavigation>
  )
}
