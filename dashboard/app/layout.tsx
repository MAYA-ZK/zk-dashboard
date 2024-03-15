import { cn } from '@nextui-org/system'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Providers } from '../components/providers'
import './globals.css'
import type { ReactNode } from 'react'
import MayaNavbar from '@/components/ui/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZK Dashboard',
  description: 'ZK Dashboard',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'flex h-screen flex-col')}>
        <Providers>
          <MayaNavbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
