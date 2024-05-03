import RootLayout from '@/components/layout'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return <RootLayout className="bg-white">{children}</RootLayout>
}
