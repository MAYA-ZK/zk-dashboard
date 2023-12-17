'use client'

import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider className="flex grow flex-col ">
      <NextThemesProvider attribute="class">{children}</NextThemesProvider>
    </NextUIProvider>
  )
}
