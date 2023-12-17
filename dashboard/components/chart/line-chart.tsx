'use client'

import type { ChartData, DefaultDataPoint } from 'chart.js'
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
import 'chartjs-adapter-date-fns'
import { format } from 'date-fns'
import { Line } from 'react-chartjs-2'

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

export function LineChart<TData = DefaultDataPoint<'line'>, TLabel = unknown>({
  chartData,
  unit,
}: {
  chartData: ChartData<'line', TData, TLabel>
  unit: 'day' | 'hour'
}) {
  return (
    <div className="relative size-full">
      <Line
        options={{
          normalized: true,
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: { borderWidth: 2, borderColor: 'blue' },
            point: { pointStyle: false },
          },
          scales: {
            x: {
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
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (context) => {
                  return format(
                    new Date(context[0].parsed.x),
                    unit === 'day' ? 'dd MMM yyyy' : 'dd MMM yyyy, HH:mm'
                  )
                },
              },
              axis: 'x',
              intersect: false,
              boxHeight: 0,
              boxWidth: 0,
            },
          },
        }}
        data={chartData}
      />
    </div>
  )
}
