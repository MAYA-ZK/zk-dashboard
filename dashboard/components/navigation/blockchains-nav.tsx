'use client'

import { BLOCKCHAIN_LINKS } from '@/config/navigation'
import { useMatchPath } from '@/lib/hooks/match-path'
import Image from 'next/image'

import { NavLink } from './navigation-link'
import SideNavigation from './side-navigation'

const ROUTES_TO_MATCH = Object.values(BLOCKCHAIN_LINKS).map((link) => link.path)

export function BlockchainsNav({
  className,
  activeColor,
}: {
  className?: string
  activeColor?: string
}) {
  const isMatch = useMatchPath(ROUTES_TO_MATCH)

  if (!isMatch) {
    return null
  }

  return (
    <SideNavigation className={className}>
      {Object.values(BLOCKCHAIN_LINKS).map((blockchain) => (
        <li key={blockchain.path}>
          <NavLink
            href={blockchain.path}
            variant="blockchain"
            activeColor={activeColor}
          >
            <Image
              src={blockchain.logo}
              alt={`${blockchain.title} logo`}
              width={10}
              height={10}
              className="size-5"
            />
            <p>{blockchain.title}</p>
          </NavLink>
        </li>
      ))}
    </SideNavigation>
  )
}
