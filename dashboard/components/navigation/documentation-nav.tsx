'use client'

import { DOCUMENTATION } from '@/app/(dashboard)/documentation/documentation'
import SideNavigation from '@/components/navigation/side-navigation'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'

import { NavLink } from './navigation-link'

export function DocumentationNav({ className }: { className?: string }) {
  const isMatch = useMatchPath(routes.documentation)

  if (!isMatch) {
    return null
  }

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

  return (
    <SideNavigation className={className}>{tableOfContents}</SideNavigation>
  )
}
