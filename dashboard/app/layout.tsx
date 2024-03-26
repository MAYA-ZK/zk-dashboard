import { Navbar } from '@/components/navbar'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

import { Providers } from '../components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZK Dashboard',
  description: 'ZK Dashboard',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          'flex min-h-screen flex-col items-center bg-muted'
        )}
      >
        <Providers>
          <Navbar />
          <div className="flex size-full max-w-screen-2xl grow flex-col px-2 pt-16 md:px-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
