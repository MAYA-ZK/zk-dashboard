'use client'

import type { NavigationLinkProps } from '@/components/navigation/navigation-link'
import { NavLink } from '@/components/navigation/navigation-link'
import { GENERAL_LINKS } from '@/config/navigation'
import { useMatchPath } from '@/lib/hooks/match-path'
import { cn } from '@/lib/utils'
import Link from 'next/link'

import { DOCUMENTATION } from '../documentation'

export function ToDocumentationLink({ onOpenChange }: NavigationLinkProps) {
  const path = GENERAL_LINKS.documentation.path
  const title = GENERAL_LINKS.documentation.title
  const shouldDisplay = !useMatchPath(path)

  if (!shouldDisplay) {
    return null
  }

  return (
    <NavLink href={path} className="flex items-center gap-x-2 hover:underline">
      {onOpenChange ? (
        <button onClick={() => onOpenChange(false)}>{title}</button>
      ) : (
        title
      )}
    </NavLink>
  )
}

function DocumentationNavLink({ section }: { section: string }) {
  return (
    <Link href={`/documentation#${section}`} className="hover:underline">
      {section}
    </Link>
  )
}

export function DocumentationNav({ className }: { className?: string }) {
  const shouldDisplay = useMatchPath('/documentation')

  if (!shouldDisplay) {
    return null
  }

  return (
    <nav
      aria-labelledby="blockchains-navigation-title"
      className={cn('w-40', className)}
    >
      <>
        <ol role="list" className="mt-4 space-y-3 font-medium">
          {Object.values(DOCUMENTATION).map((section) => (
            <li key={section.title}>
              <DocumentationNavLink section={section.title} />
            </li>
          ))}
        </ol>
      </>
    </nav>
  )
}
