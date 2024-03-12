import { type ReactNode } from 'react'

export default async function Home({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-full grow flex-col items-center gap-8 p-5 md:p-10">
      {children}
    </main>
  )
}
