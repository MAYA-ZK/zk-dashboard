'use client'

import { Bar } from 'react-chartjs-2'

// eslint-disable-next-line react/function-component-definition
export const BarChart: typeof Bar = (props) => {
  return <Bar {...props} />
}
