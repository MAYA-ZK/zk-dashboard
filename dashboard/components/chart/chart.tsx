'use client'

import type { ChartType, DefaultDataPoint } from 'chart.js'
// TOOD: import only when plugin is used
import 'chartjs-adapter-date-fns'
import type { ComponentProps } from 'react'
import { Chart as ReactChart } from 'react-chartjs-2'

import type { FORCE_ANY } from '@/lib/types'
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
import { format } from 'date-fns'

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function Chart<
  TType extends ChartType = ChartType,
  TData = DefaultDataPoint<TType>,
  TLabel = unknown,
>({
  options: optionsProp,
  ...props
}: ComponentProps<typeof ReactChart<TType, TData, TLabel>>) {
  const options = optionsProp ?? ({} as NonNullable<typeof optionsProp>)
  const plugins = (options as FORCE_ANY).plugins as FORCE_ANY
  return (
    <ReactChart
      options={{
        ...options,
        plugins: {
          ...plugins,
          tooltip: {
            axis: 'x',
            intersect: false,
            boxHeight: 0,
            boxWidth: 0,
            ...plugins?.tooltip,
            callbacks: {
              title: (context) => {
                const parsed = context[0].parsed
                if (
                  typeof parsed === 'object' &&
                  parsed !== null &&
                  'x' in parsed
                ) {
                  return format(
                    new Date(parsed.x as string),
                    // options?.unit === 'hour'
                    //   ? 'dd MMM yyyy, HH:mm'
                    // : 'dd MMM yyyy'
                    'dd MMM yyyy'
                  )
                }
              },
              ...plugins?.tooltip?.callbacks,
            },
          },
        },
      }}
      {...props}
    />
  )
}
