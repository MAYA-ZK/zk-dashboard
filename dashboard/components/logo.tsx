import { cn } from '@/lib/utils'
import MayaLogoPrimary2 from '@/public/maya-primary-logo.svg'
import MayaLogoSecondary2 from '@/public/maya-secondary-logo.svg'
import type { ComponentProps } from 'react'

const logos = {
  mayaPrimary: {
    size: { default: { w: 153, h: 51 }, sm: { w: 116, h: 34 } },
    currentColor: 'text-black',
    src: MayaLogoPrimary2,
  },
  mayaSecondary: {
    size: { default: { w: 72, h: 72 }, sm: { w: 72, h: 72 } },
    currentColor: 'text-muted',
    src: MayaLogoSecondary2,
  },
}

interface LogoProps extends ComponentProps<'svg'> {
  id: keyof typeof logos
}

export function Logo({ id, className, ...props }: LogoProps) {
  const logo = logos[id]
  const LogoElement = logo.src

  /* BREAKING CHANGES: This change remove support:
   * - dark/light theme
   * - media query dynamic sizes
   * */
  return (
    <LogoElement
      {...props}
      className={cn(`${logo.currentColor}`, className)}
      width={logo.size.default.w}
      height={logo.size.default.h}
    />
  )
}
