import { matchPath } from '@/lib/path'
import { usePathname } from 'next/navigation'

export function useMatchPath(pattern: string | Array<string> | null) {
  const pathname = usePathname()
  const parsedPattern = Array.isArray(pattern) ? pattern.join('|') : pattern

  return matchPath(pathname, parsedPattern)
}
