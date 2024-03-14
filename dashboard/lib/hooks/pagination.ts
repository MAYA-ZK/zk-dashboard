import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import qs from 'query-string'
import { useOptimistic, useTransition } from 'react'

export const usePagination = (page: number, paramKey: string) => {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [optimisticPage, updateOptimisticPage] = useOptimistic(
    page,
    (_, newPage: number) => newPage
  )

  const changePage = (newPage: number) => {
    const currentSearchParams = qs.parse(searchParams.toString())

    const params = qs.stringify({
      ...currentSearchParams,
      [paramKey]: newPage,
    })

    startTransition(() => {
      updateOptimisticPage(newPage)
      replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      })
    })
  }

  return { isPending, page: optimisticPage, changePage }
}
