import { Chart } from '@/components/chart/chart'
import { commonOptions } from '@/components/chart/config'
import { COLORS } from '@/config/colors'
import { getDailyCreatedBatchesWithAverage } from '@/services/scroll/charts'

export async function DailyCreatedBatchesWithAverage() {
  const { datasets, labels } = await getDailyCreatedBatchesWithAverage()

  return (
    <Chart
      options={{
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y1: {
            type: 'linear',
            display: true,
            position: 'right',

            // grid line settings
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        },
      }}
      type="bar"
      data={{
        labels,
        datasets: [
          {
            data: datasets.avgTxsPerBatch,
            label: 'Average txs per batch',
            borderColor: COLORS.SECONDARY,
            backgroundColor: COLORS.SECONDARY,
            type: 'line',
            yAxisID: 'y1',
          },
          {
            data: datasets.batchCount,
            label: 'Batch count',
            borderColor: COLORS.PRIMARY,
            backgroundColor: COLORS.PRIMARY,
            yAxisID: 'y',
          },
        ],
      }}
    />
  )
}
