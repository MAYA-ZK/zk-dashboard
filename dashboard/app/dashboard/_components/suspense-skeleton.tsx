import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

export function SuspenseWithSkeleton({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<Skeleton className="grow" />}>{children}</Suspense>
  )
}
