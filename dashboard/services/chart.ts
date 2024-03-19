import { mapValues } from 'lodash'

type ChartData<T extends string> = {
  labels: Array<Date>
  datasets: Record<T, Array<number>>
}

/**
 * Normalize the data to be used in the chart
 * @param data: the array of data to be normalized
 * @param getLabel: a function to get the label for the chart
 * @param datasets: a record of functions to get the data for each dataset
 */
export const normalizeChartData = <T, TKey extends string>(
  data: Array<T>,
  {
    getLabel,
    datasets,
  }: {
    getLabel: (value: T) => Date
    datasets: Record<TKey, (value: T) => number>
  }
) => {
  return data.reduce(
    (acc, currValue) => {
      const datasetsValue = mapValues(datasets, (getData, key) => {
        const prevValues = acc.datasets?.[key as keyof typeof datasets] || []
        return [...prevValues, getData(currValue)]
      })
      const label = getLabel(currValue)

      return {
        labels: [...acc.labels, label],
        datasets: datasetsValue,
      } as ChartData<TKey>
    },
    { datasets: {}, labels: [] as Array<Date> } as ChartData<TKey>
  )
}
