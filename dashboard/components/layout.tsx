import { Footer } from '@/components/footer'
import { DocumentationNav } from '@/components/navigation/documentation-nav'
import { Navbar } from '@/components/navigation/navbar'
import { Providers } from '@/components/providers'
import { cn } from '@/lib/utils'
import { Analytics } from '@vercel/analytics/react'
import { Sora } from 'next/font/google'
import type { ReactNode } from 'react'

import '../app/globals.css'
import { BlockchainsNav } from './navigation/blockchains-nav'

const sora = Sora({ subsets: ['latin'] })

export function RootLayout({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          className,
          sora.className,
          'flex min-h-screen flex-col items-center'
        )}
      >
        <Providers>
          <Navbar />
          <div className="flex size-full max-w-screen-2xl grow flex-col px-2 pt-16 md:px-10">
            {children}
          </div>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}

const BASE_LAYOUT_CONFIG = {
  documentation: {
    style: 'bg-white',
    navigation: <DocumentationNav />,
  },
  dashboard: {
    style: 'bg-muted',
    navigation: (
      <BlockchainsNav activeColor="text-primary" className="text-sm" />
    ),
  },
}

export function BaseLayout({
  variant,
  children,
}: {
  variant: keyof typeof BASE_LAYOUT_CONFIG
  children: ReactNode
}) {
  const style = BASE_LAYOUT_CONFIG[variant].style
  const navigation = BASE_LAYOUT_CONFIG[variant].navigation

  return (
    <RootLayout className={cn(style)}>
      <main className="flex h-full grow flex-col gap-5 pb-4">
        <div className="flex gap-5">
          <div className="hidden md:sticky md:top-[7.75rem] md:block md:h-fit md:flex-none md:overflow-y-auto md:py-16">
            {navigation}
          </div>

          <div className="overflow-auto">{children}</div>
        </div>
      </main>
    </RootLayout>
  )
}
