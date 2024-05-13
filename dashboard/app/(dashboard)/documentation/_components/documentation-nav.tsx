'use client'

import { NavLink } from '@/components/navigation/navigation-link'
import SideNavigation from '@/components/navigation/side-navigation'
import { GENERAL_LINKS } from '@/config/navigation'
import { routes } from '@/config/routes'
import { useMatchPath } from '@/lib/hooks/match-path'
import Link from 'next/link'

import { DOCUMENTATION } from '../documentation'

const shouldDisplayMatch = '/documentation'
export function ToDocumentationLink() {
  const path = GENERAL_LINKS.documentation.path
  const title = GENERAL_LINKS.documentation.title
  const shouldDisplay = !useMatchPath(path)

  if (!shouldDisplay) {
    return null
  }

  return (
    <NavLink href={path} className="flex items-center gap-x-2 hover:underline">
      {title}
    </NavLink>
  )
}

function DocumentationNavLink({ section }: { section: string }) {
  return (
    <Link
      href={routes.documentationSection(section)}
      className="hover:underline"
    >
      {section}
    </Link>
  )
}

export function DocumentationNav({ className }: { className?: string }) {
  return (
    <SideNavigation
      shouldDisplayRegex={shouldDisplayMatch}
      contentListChildren={Object.values(DOCUMENTATION).map((section) => (
        <li key={section.title}>
          <DocumentationNavLink section={section.title} />
        </li>
      ))}
      className={className}
    />
  )
}
