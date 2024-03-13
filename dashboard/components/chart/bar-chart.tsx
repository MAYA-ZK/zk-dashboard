'use client'

import 'chartjs-adapter-date-fns'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

// eslint-disable-next-line react/function-component-definition
export const BarChart: typeof Bar = (props) => {
  return <Bar {...props} />
}
