import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

export function InfoTooltip({
  className,
  contentClassName,
  content,
}: {
  contentClassName?: string
  className?: string
  content: ReactNode
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger aria-label="info" className={className}>
          <Info size={12} />
        </TooltipTrigger>
        <TooltipContent className={cn('w-48 normal-case', contentClassName)}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
