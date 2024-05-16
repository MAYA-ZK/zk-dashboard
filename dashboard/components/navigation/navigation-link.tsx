import { useMatchPath } from '@/lib/hooks/match-path'
import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'
import Link from 'next/link'
import type { ComponentProps } from 'react'

const navLinkVariants = cva('text-primary-foreground hover:underline', {
  variants: {
    variant: {
      blockchain: 'flex items-center gap-x-2',
      documentation: '',
    },
  },
  defaultVariants: {
    variant: undefined,
  },
})

export interface NavLinkProps
  extends ComponentProps<typeof Link>,
    VariantProps<typeof navLinkVariants> {
  activeColor?: string
}

export function NavLink({
  href,
  className,
  activeColor,
  variant,
  ...props
}: NavLinkProps) {
  const path = typeof href === 'string' ? href : href.pathname
  const isLinkActive = useMatchPath(path ?? null)

  const color = isLinkActive && activeColor ? activeColor : 'text-black'

  return (
    <Link
      href={href}
      className={cn(
        navLinkVariants({
          variant,
          className,
        }),
        color
      )}
      {...props}
    />
  )
}

export function HideOnActiveNavLink({
  path,
  title,
}: {
  path: string
  title: string
}) {
  const isMatch = useMatchPath(path)

  if (isMatch) {
    return null
  }

  return <NavLink href={path}>{title}</NavLink>
}
