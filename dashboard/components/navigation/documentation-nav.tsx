'use client'

import { DOCUMENTATION } from '@/app/(dashboard)/documentation/documentation'
import SideNavigation from '@/components/navigation/side-navigation'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'

import { NavLink } from './navigation-link'

const IS_MATCH_PATH = routes.documentation

export function DocumentationNav({ className }: { className?: string }) {
  const tableOfContents = DOCUMENTATION.map((block) => {
    const sectionTitle = block.sections.filter(
      (section) => section.type === 'title'
    )

    return sectionTitle.map((section) => (
      <li key={section.content}>
        <NavLink
          href={routes.documentationSection(block.id)}
          variant="documentation"
        >
          {section.content}
        </NavLink>
      </li>
    ))
  })
  const isMatch = useMatchPath(IS_MATCH_PATH)

  if (!isMatch) {
    return null
  }

  return (
    <SideNavigation className={className}>{tableOfContents}</SideNavigation>
  )
}
