import { COLORS } from '@/config/colors'
import type { ChartOptions } from 'chart.js'

export type CommonOptions = {
  yMaxTicksLimit?: number
  xMaxTicksLimit?: number
  yStacked?: boolean
  xStacked?: boolean
  unit?: 'day' | 'hour'
}

export const commonOptions = {
  normalized: true,
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: { borderWidth: 2, borderColor: COLORS.PRIMARY },
    point: { pointStyle: false },
  },
  scales: {
    y: {
      stacked: false,
      border: { display: false },
    },
    x: {
      stacked: false,
      grid: { display: false },
      type: 'time',
      time: { unit: 'day' },
      ticks: { maxTicksLimit: 10 },
    },
  },
  animations: {
    x: { duration: 0 },
    y: { duration: 250, easing: 'easeOutBack' },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 16,
        boxHeight: 16,
        borderRadius: 2,
        useBorderRadius: true,
      },
    },
  },
} satisfies ChartOptions
