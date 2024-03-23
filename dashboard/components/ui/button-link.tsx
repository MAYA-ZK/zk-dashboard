import type { ButtonProps } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import type { LinkProps } from 'next/link'
import Link from 'next/link'

interface ButtonLinkProps extends ButtonProps {
  href: LinkProps['href']
}

export function ButtonLink({ href, ...props }: ButtonLinkProps) {
  return (
    <Button asChild {...props}>
      <Link href={href}>{props.children}</Link>
    </Button>
  )
}
