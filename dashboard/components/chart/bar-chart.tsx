'use client'

import { formatCurrency } from '@/lib/formatters'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { format } from 'date-fns'
import type { ComponentProps } from 'react'
import { Bar } from 'react-chartjs-2'

import type { Currency } from '@zk-dashboard/common/lib/currency'

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

interface BarChartProps extends ComponentProps<typeof Bar> {
  currency?: Currency
  unit?: 'day' | 'hour'
}

export function BarChart({ unit, currency, options, ...props }: BarChartProps) {
  return (
    <Bar
      options={{
        ...options,
        scales: {
          ...options?.scales,
          y: {
            ...options?.scales?.y,
            ticks: {
              ...options?.scales?.y?.ticks,
              callback: currency
                ? (tickValue) => {
                    return formatCurrency(
                      currency,
                      Number(tickValue),
                      currency === 'eth' ? 8 : 2
                    )
                  }
                : undefined,
            },
          },
        },
        plugins: {
          ...options?.plugins,
          tooltip: {
            axis: 'x',
            intersect: false,
            boxHeight: 0,
            boxWidth: 0,
            ...options?.plugins?.tooltip,
            callbacks: {
              label: currency
                ? (context) => {
                    return `${context.dataset.label}: ${formatCurrency(
                      currency,
                      Number(context.parsed.y),
                      currency === 'eth' ? 8 : 2
                    )}`
                  }
                : undefined,
              title: (context) => {
                return format(
                  new Date(context[0].parsed.x),
                  unit === 'hour' ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy'
                )
              },
              ...options?.plugins?.tooltip?.callbacks,
            },
          },
        },
      }}
      {...props}
    />
  )
}
