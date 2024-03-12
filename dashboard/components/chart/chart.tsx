'use client'

import type { ChartType, DefaultDataPoint } from 'chart.js'
// TOOD: import only when plugin is used
// import 'chartjs-adapter-date-fns'
import type { ComponentProps } from 'react'
import { Chart as ReactChart } from 'react-chartjs-2'

export function Chart<
  TType extends ChartType = ChartType,
  TData = DefaultDataPoint<TType>,
  TLabel = unknown,
>(props: ComponentProps<typeof ReactChart<TType, TData, TLabel>>) {
  return <ReactChart {...props} />
}
