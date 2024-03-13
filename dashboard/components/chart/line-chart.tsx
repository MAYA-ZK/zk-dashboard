'use client'

import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import {
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
import { format } from 'date-fns'
import type { ComponentProps } from 'react'
import { formatToUsd } from '@/lib/formatters'

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface LineChartProps extends ComponentProps<typeof Line> {
  currency?: {
    usd?: boolean
  }
  unit?: 'day' | 'hour'
}

export function LineChart({
  unit,
  currency,
  options,
  ...props
}: LineChartProps) {
  return (
    <Line
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
                    return formatToUsd(Number(tickValue))
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
                    return `${context.dataset.label}: ${formatToUsd(
                      context.parsed.y
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
