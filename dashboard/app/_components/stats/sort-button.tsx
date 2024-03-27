'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SortDirection } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

export function SortButton({
  onClick,
  sortedState,
}: {
  onClick: () => void
  sortedState: false | SortDirection
}) {
  return (
    <Button
      variant="ghost"
      className={cn('h-4 p-2', {
        'bg-primary': ['asc', 'desc'].includes(String(sortedState)),
      })}
      onClick={onClick}
    >
      {
        {
          asc: <ArrowDown size={12} />,
          desc: <ArrowUp size={12} />,
          false: <ArrowUpDown size={12} />,
        }[String(sortedState)]
      }
    </Button>
  )
}
