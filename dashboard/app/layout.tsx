import { ThemeSwitcher } from '@/components/theme-switcher'
import { routes } from '@/config/routes'
import { cn } from '@nextui-org/system'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

import { Providers } from '../components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZK Dashboard',
  description: 'ZK Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'flex h-screen flex-col')}>
        <Providers>
          <nav className="flex w-full items-center justify-between border-b border-b-primary-100 p-5">
            <h1 className="text-xl font-semibold">
              <Link href={routes.home}>ZK Dashboard</Link>
            </h1>
            <div className="flex items-center justify-between space-x-4">
              <ThemeSwitcher />
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  )
}
