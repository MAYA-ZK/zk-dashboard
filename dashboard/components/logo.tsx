import { cn } from '@nextui-org/system'
import type { ImageProps } from 'next/image'
import Image from 'next/image'

const logos = {
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
