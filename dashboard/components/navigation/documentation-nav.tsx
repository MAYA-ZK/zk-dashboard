'use client'

import { DOCUMENTATION } from '@/app/(dashboard)/documentation/documentation'
import { NavLink } from '@/components/navigation/navigation-link'
import SideNavigation from '@/components/navigation/side-navigation'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'

const IS_MATCH_PATH = routes.documentation

export function DocumentationNav() {
  const isMatch = useMatchPath(IS_MATCH_PATH)

  if (!isMatch) {
    return null
  }

  return (
    <SideNavigation>
      {Object.values(DOCUMENTATION).map((section) => {
        const path = routes.documentationSection(section.title)

        return (
          <li key={section.title}>
            <NavLink href={path} variant="documentation">
              {section.title}
            </NavLink>
          </li>
        )
      })}
    </SideNavigation>
  )
}
