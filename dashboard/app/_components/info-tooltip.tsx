import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CheckCircle, Info } from 'lucide-react'
import type { ReactNode } from 'react'

const icons = {
  info: <Info className="size-3" />,
  checkCircle: <CheckCircle className="size-4 text-primary" />,
}

export function InfoTooltip({
  className,
  contentClassName,
  content,
  iconVariant = 'info',
}: {
  contentClassName?: string
  className?: string
  content: ReactNode
  iconVariant?: keyof typeof icons
}) {
  const iconElement = icons[iconVariant]

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger aria-label="info" className={className}>
          {iconElement}
        </TooltipTrigger>
        <TooltipContent className={cn('w-48 normal-case', contentClassName)}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
