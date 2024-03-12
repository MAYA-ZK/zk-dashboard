import { COLORS } from '@/config/colors'
import type { DeepPartial, UnionToIntersection } from '@/lib/types'
import type {
  ChartOptions,
  ChartType,
  ParsedDataType,
  PluginOptionsByType,
  TooltipItem,
} from 'chart.js'

import { format } from 'date-fns'

export type CommonOptions = {
  yMaxTicksLimit?: number
  xMaxTicksLimit?: number
  yStacked?: boolean
  xStacked?: boolean
  unit?: 'day' | 'hour'
}
export const plugins = <TType extends ChartType = ChartType>(
  unit: 'day' | 'hour'
) => {
  return {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (context: [TooltipItem<TType>]) => {
          const parsed = context[0].parsed as UnionToIntersection<
            ParsedDataType<TType>
          >
          if (typeof parsed === 'object' && parsed !== null && 'x' in parsed) {
            return format(
              new Date(parsed.x as number),
              unit === 'hour' ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy'
            )
          }
        },
      },
      axis: 'x',
      intersect: false,
      boxHeight: 0,
      boxWidth: 0,
    },
  } satisfies DeepPartial<PluginOptionsByType<TType>>
}

export const commonOptions = (options?: CommonOptions) =>
  ({
    normalized: true,
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { borderWidth: 2, borderColor: COLORS.PRIMARY },
      point: { pointStyle: false },
    },
    scales: {
      y: {
        stacked: options?.yStacked ?? false,
        border: { display: false },
        ticks: { maxTicksLimit: options?.yMaxTicksLimit },
      },
      x: {
        stacked: options?.xStacked ?? false,
        grid: { display: false },
        type: 'time',
        time: { unit: 'day' },
        ticks: { maxTicksLimit: options?.xMaxTicksLimit ?? 10 },
      },
    },
    animations: {
      x: { duration: 0 },
      y: { duration: 250, easing: 'easeOutBack' },
    },
    // TODO: handle this on client
    // plugins: {
    //   legend: { display: false },
    //   tooltip: {
    //     callbacks: {
    //       title: (context) => {
    //         return format(
    //           new Date(context[0].parsed.x),
    //           options?.unit === 'hour' ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy'
    //         )
    //       },
    //     },
    //     axis: 'x',
    //     intersect: false,
    //     boxHeight: 0,
    //     boxWidth: 0,
    //   },
    // },
  }) satisfies ChartOptions
