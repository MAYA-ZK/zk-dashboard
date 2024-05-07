import RootLayout from '@/components/layout'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { DocumentationNav } from './_components/documentation-nav'

export const metadata: Metadata = {
  title: 'ZK Dashboard',
  description: 'ZK Dashboard',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootLayout className="bg-white">
      <main className="flex h-full grow flex-col gap-5 pb-4">
        <div className="flex gap-5">
          <div className="hidden md:sticky md:top-[7.75rem] md:block md:h-fit md:flex-none md:overflow-y-auto md:py-16 md:pr-6 ">
            <DocumentationNav />
          </div>
          {children}
        </div>
      </main>
    </RootLayout>
  )
}
