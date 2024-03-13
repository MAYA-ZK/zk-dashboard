import { mapValues } from 'lodash'

import {
  scrollBatchAvgCostMV,
  scrollBatchCreatedMv,
} from '@zk-dashboard/common/database/materialized-view/scroll'
import { db } from '@zk-dashboard/common/database/utils'

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
const normalizeChartData = <T, TKey extends string>(
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

/**
 *  Batches that are created daily with the average number of transactions per batch
 */
export async function getDailyCreatedBatchesWithAverage() {
  const result = await db.select().from(scrollBatchCreatedMv)

  return normalizeChartData(result, {
    getLabel: (value) => value.tx_date,
    datasets: {
      avgTxsPerBatch: (value) => value.avg_txs_per_batch,
      batchCount: (value) => value.batch_count,
    },
  })
}

export async function getBatchesAvgCosts() {
  const result = await db.select().from(scrollBatchAvgCostMV)

  return normalizeChartData(result, {
    getLabel: (value) => value.tx_date,
    datasets: {
      avgCommitCostUsd: (value) => Number(value.avg_commit_cost_usd),
      avgVerificationConstUsd: (value) =>
        Number(value.avg_verification_cost_usd),
    },
  })
}
