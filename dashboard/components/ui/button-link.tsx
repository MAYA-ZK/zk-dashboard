import type { ButtonProps } from '@nextui-org/react'
import { Button } from '@nextui-org/react'
import type { LinkProps } from 'next/link'
import Link from 'next/link'

interface ButtonLinkProps
  extends Omit<ButtonProps, keyof Omit<LinkProps, 'as'>>,
    Omit<LinkProps, 'as'> {
  href: LinkProps['href']
}

export function ButtonLink({ href, ...props }: ButtonLinkProps) {
  return (
    <Button
      as={Link}
      // @ts-expect-error: `next/link` types are not compatible with `@nextui-org/react` types for `href`
      href={href}
      {...props}
    />
  )
}
