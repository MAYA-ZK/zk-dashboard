import { cn } from '@/lib/utils'
import type { ImageProps } from 'next/image'
import Image from 'next/image'

const logos = {
  mayaPrimary: {
    light: {
      alt: 'Maya Primary Logo',
      width: 72,
      height: 72,
      src: '/maya-primary-logo-light.svg',
    },
    dark: {
      alt: 'Maya Primary Logo',
      width: 72,
      height: 72,
      src: '/maya-primary-logo-dark.svg',
    },
  },
  mayaSecondary: {
    light: {
      alt: 'Maya Secondary Logo',
      width: 72,
      height: 72,
      src: '/maya-secondary-logo-light.svg',
    },
    dark: {
      alt: 'Maya Secondary Logo',
      width: 72,
      height: 72,
      src: '/maya-secondary-logo-dark.svg',
    },
  },
  scrollBlockchain: {
    light: {
      alt: 'Scroll Blockchain Logo',
      width: 80,
      height: 25,
      src: 'scroll-logo-dark.svg',
    },
    dark: {
      alt: 'Scroll Blockchain Logo',
      width: 80,
      height: 25,
      src: 'scroll-logo-light.svg',
    },
  },
} as const

interface LogoProps extends Omit<ImageProps, 'src' | 'alt'> {
  id: keyof typeof logos
}

export function Logo({ id, className, ...imageProps }: LogoProps) {
  const logo = logos[id]

  return (
    <>
      <Image
        className={cn('dark:hidden', className)}
        {...logo.light}
        alt={logo.light.alt}
        {...imageProps}
      />
      <Image
        className={cn('hidden dark:block', className)}
        {...logo.dark}
        alt={logo.dark.alt}
        {...imageProps}
      />
    </>
  )
}
