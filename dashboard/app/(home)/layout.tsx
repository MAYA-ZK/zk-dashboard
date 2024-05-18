import { RootLayout } from '@/components/layout'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'ZK Dashboard',
  description: 'ZK Dashboard',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <RootLayout className="bg-muted">{children}</RootLayout>
}
