import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navigation/navbar'
import { Providers } from '@/components/providers'
import { cn } from '@/lib/utils'
import { Analytics } from '@vercel/analytics/react'
import { Sora } from 'next/font/google'
import type { ReactNode } from 'react'

import '../app/globals.css'

const sora = Sora({ subsets: ['latin'] })

export default function RootLayout({
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
