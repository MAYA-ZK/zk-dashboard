import { BarChart } from '@/components/chart/bar-chart'
import { Chart } from '@/components/chart/chart'
import { commonOptions } from '@/components/chart/config'
import { LineChart } from '@/components/chart/line-chart'

const { labels, datasets } = {
  labels: [
    new Date('2024-03-04T23:00:00.000Z'),
    new Date('2024-03-05T23:00:00.000Z'),
    new Date('2024-03-06T23:00:00.000Z'),
    new Date('2024-03-07T23:00:00.000Z'),
    new Date('2024-03-08T23:00:00.000Z'),
    new Date('2024-03-09T23:00:00.000Z'),
    new Date('2024-03-10T23:00:00.000Z'),
    new Date('2024-03-11T23:00:00.000Z'),
  ],
  datasets: {
    min: [
      0.45, 0.8222222222222222, 0.8666666666666667, 0.7925925925925926, 0.9875,
      1.1944444444444444, 0.6375, 1.038888888888889,
    ],
    max: [19.9, 4.4, 12.8, 7.175, 13.45, 8.3, 12.35, 5.56],
    avg: [
      2.819452996708142, 1.8341994070279355, 2.4930295675597858,
      2.428825256683065, 3.4256652998716333, 3.257660725188596,
      2.964534152727586, 2.762509168256035,
    ],
  },
}
export default async function Page() {
  const options = commonOptions({ xStacked: true })
  return (
    <>
      <div className="h-unit-8xl w-full rounded-md bg-content1 p-8">
        <h2 className="text-center">Mixed chart</h2>
        <Chart
          options={options}
          type="bar"
          data={{
            labels,
            datasets: [
              {
                data: datasets.max,
                label: 'Max',
                backgroundColor: 'green',
              },
              {
                data: datasets.max,
                label: 'Max',
                backgroundColor: 'green',
                type: 'line',
              },
            ],
          }}
        />
      </div>
      <div className="h-unit-8xl w-full rounded-md bg-content1 p-4">
        <h2 className="text-center">Stacked bar chart</h2>
        <BarChart
          options={commonOptions({ xStacked: true })}
          data={{
            labels,
            datasets: [
              {
                data: datasets.min,
                label: 'Min',
                backgroundColor: 'purple',
              },
              {
                data: datasets.avg,
                label: 'Avg',
                backgroundColor: 'orange',
              },
              {
                data: datasets.max,
                label: 'Max',
                backgroundColor: 'green',
              },
            ],
          }}
        />
      </div>
      <div className="h-unit-8xl w-full rounded-md bg-content1 p-4">
        <h2 className="text-center">Mixed chart</h2>
        <LineChart
          options={commonOptions()}
          data={{
            labels,
            datasets: [
              {
                data: datasets.min,
                label: 'Min',
                backgroundColor: 'purple',
              },
              {
                data: datasets.avg,
                label: 'Avg',
                backgroundColor: 'orange',
              },
              {
                data: datasets.max,
                label: 'Max',
                backgroundColor: 'green',
              },
            ],
          }}
        />
      </div>
    </>
  )
}
