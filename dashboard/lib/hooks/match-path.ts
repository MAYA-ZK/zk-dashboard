import { matchPath } from '@/lib/path'
import { usePathname } from 'next/navigation'

export function useMatchPath(pattern: string | null) {
  const pathname = usePathname()
  return matchPath(pathname, pattern)
}
