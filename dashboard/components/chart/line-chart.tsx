'use client'

import { Line } from 'react-chartjs-2'

// eslint-disable-next-line react/function-component-definition
export const LineChart: typeof Line = (props) => {
  return <Line {...props} />
}
