import { subDays } from 'date-fns'
import {
  avg,
  count,
  eq,
  gt,
  gte,
  isNotNull,
  max,
  min,
  sql,
  sum,
} from 'drizzle-orm'
import { mapValues } from 'lodash'

import {
  scrollBatchReceipts,
  scrollBatches,
  scrollBlocks,
} from '@zk-dashboard/common/database/schema'
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
 * Get the average gas price per day for the last X days in eth
 * @ethPrice: the current eth price in {currency}, if provided will return the average price in {currency}
 */
export async function avgTxPricePerDay(days: number, ethPrice: number = 1) {
  const results: Array<{ time: string; value: string }> = await db.execute(sql`
    SELECT
      date (b.timestamp) as time,
      AVG(r.total_tx_effective_unit_price) AS value
    FROM
      scroll_batches b
      JOIN scroll_batch_receipts r ON b.id = r.batch_id
    WHERE
      b.timestamp > now() - interval '${sql.raw(days.toString())} days'
    GROUP BY
      date (b.timestamp)
    ORDER BY
      date (b.timestamp)
  `)

  return normalizeChartData(results, {
    getLabel: (value) => new Date(value.time),
    datasets: {
      data: (value) => parseFloat(value.value) * ethPrice,
    },
  })
}
/**
 * Get the average gas price per hour for the last X days in eth
 * @ethPrice: the current eth price in {currency}, if provided will return the average price in {currency}
 */
export async function avgTxPricePerHour(days: number, ethPrice: number = 1) {
  const res = await db
    .select({
      hour_start: sql<Date>`date_trunc('hour', scroll_batches.timestamp)`.as(
        'hour_start'
      ),
      avg_price: avg(scrollBatchReceipts.total_tx_effective_unit_price),
    })
    .from(scrollBatches)
    .leftJoin(
      scrollBatchReceipts,
      eq(scrollBatches.id, scrollBatchReceipts.batch_id)
    )
    .where(gte(scrollBatches.timestamp, subDays(new Date(), days)))
    .groupBy(sql`hour_start`)
    .orderBy(sql`hour_start`)

  return normalizeChartData(res, {
    getLabel: (value) => value.hour_start,
    datasets: {
      data: (value) => parseFloat(value.avg_price as string) * ethPrice,
    },
  })
}

export async function getAvgBlockSizePerDay(days: number) {
  const res = await db
    .select({
      day_start: sql<Date>`date_trunc('day', scroll_blocks.timestamp)`.as(
        'day_start'
      ),
      avg_block_size: avg(scrollBlocks.size),
    })
    .from(scrollBlocks)
    .where(
      gte(
        sql`scroll_blocks.timestamp`,
        sql`CURRENT_DATE - INTERVAL '${sql.raw(days.toString())} days'`
      )
    )
    .groupBy(sql`day_start`)
    .orderBy(sql`day_start`)

  return normalizeChartData(res, {
    getLabel: (value) => value.day_start,
    datasets: {
      data: (value) => parseFloat(value.avg_block_size as string),
    },
  })
}

export async function getAvgBlockTime(days: number) {
  const subQuery = db
    .select({
      day_start: sql<Date>`DATE_TRUNC('day', scroll_blocks.timestamp)`.as(
        'day_start'
      ),
      timestamp: scrollBlocks.timestamp,
      prev_timestamp: sql<Date>`
        LAG(scroll_blocks.timestamp) OVER (
          PARTITION BY
            DATE_TRUNC('day', scroll_blocks.timestamp)
          ORDER BY
            scroll_blocks.timestamp
        )
      `.as('prev_timestamp'),
      time_between_transactions: sql<number>`
        scroll_blocks.timestamp - LAG(scroll_blocks.timestamp) OVER (
          PARTITION BY
            DATE_TRUNC('day', scroll_blocks.timestamp)
          ORDER BY
            scroll_blocks.timestamp
        )
      `.as('time_between_transactions'),
    })
    .from(scrollBlocks)
    .where(
      gte(
        sql`scroll_blocks.timestamp`,
        sql`CURRENT_DATE - INTERVAL '${sql.raw(days.toString())} days'`
      )
    )

  const res = await db
    .select({
      day_start: sql<Date>`day_start`,
      avg_time_between_transactions: sql<number>`
        AVG(
          EXTRACT(
            EPOCH
            FROM
              time_between_transactions
          )
        )
      `,
    })
    .from(subQuery.as('subquery'))
    .groupBy(sql`day_start`)
    .orderBy(sql`day_start`)

  return normalizeChartData(res, {
    getLabel: (value) => value.day_start,
    datasets: {
      data: (value) => value.avg_time_between_transactions,
    },
  })
}

export async function getGasUsagePerDay(days: number) {
  const res = await db
    .select({
      day_start: sql<Date>`date_trunc('day', scroll_blocks.timestamp)`.as(
        'day_start'
      ),
      total_gas_usage: sum(scrollBlocks.gas_used),
    })
    .from(scrollBlocks)
    .where(
      gte(
        sql`scroll_blocks.timestamp`,
        sql`CURRENT_DATE - INTERVAL '${sql.raw(days.toString())} days'`
      )
    )
    .groupBy(sql`day_start`)
    .orderBy(sql`day_start`)

  return normalizeChartData(res, {
    getLabel: (value) => value.day_start,
    datasets: {
      data: (value) => parseFloat(value.total_gas_usage as string),
    },
  })
}

export async function txPerSecond(days: number) {
  const tx_per_second_cte = db.$with('tx_per_second').as(
    db
      .select({
        timestamp: scrollBatches.timestamp,
        lead_created_at: sql<Date>`
          LEAD(timestamp) OVER (
            ORDER BY
              timestamp
          )
        `.as('lead_created_at'),
        // GREATEST is used since for some reason there are some batches with the same timestamp ¯\_(ツ)_/¯
        tx_per_second: sql<number>`
          total_tx_num / GREATEST(
            EXTRACT(
              EPOCH
              FROM
                (
                  LEAD(timestamp) OVER (
                    ORDER BY
                      timestamp
                  ) - timestamp
                )
            ),
            1
          ) AS tx_per_second
        `,
      })
      .from(scrollBatches)
      .where(
        gte(
          scrollBatches.timestamp,
          sql`CURRENT_DATE - INTERVAL '${sql.raw(days.toString())} days'`
        )
      )
      .orderBy(scrollBatches.timestamp)
  )

  const res = await db
    .with(tx_per_second_cte)
    .select({
      day: sql<string>`DATE_TRUNC('day', timestamp)`.as('day'),
      min_tx_per_second: min(sql<number>`tx_per_second`),
      max_tx_per_second: max(sql<number>`tx_per_second`),
      avg_tx_per_second: avg(sql<number>`tx_per_second`),
    })
    .from(sql`tx_per_second`)
    .where(isNotNull(sql`lead_created_at`))
    .groupBy(sql`day`)
    .orderBy(sql`day`)

  return normalizeChartData(res, {
    getLabel: (value) => new Date(value.day),
    datasets: {
      min: (value) => parseFloat(value.min_tx_per_second as string),
      max: (value) => parseFloat(value.max_tx_per_second as string),
      avg: (value) => parseFloat(value.avg_tx_per_second as string),
    },
  })
}

async function totalTxCountPerDay(days: number) {
  return await db
    .select({
      day_start: sql<Date>`date_trunc('day', scroll_batches.timestamp)`.as(
        'day_start'
      ),
      total_tx_num: sum(scrollBatches.total_tx_num),
    })
    .from(scrollBatches)
    .where(
      gt(
        scrollBatches.finalized_at,
        sql`CURRENT_DATE - INTERVAL '${sql.raw(days.toString())} days'`
      )
    )
    .groupBy(sql`day_start`)
    .orderBy(sql`day_start`)
}

export async function getTransactionCountPerDay(days: number) {
  const res = await totalTxCountPerDay(days)

  return normalizeChartData(res, {
    getLabel: (value) => value.day_start,
    datasets: {
      data: (value) => parseFloat(value.total_tx_num as string),
    },
  })
}

async function totalCommitCountPerDay(days: number) {
  return await db
    .select({
      day_start: sql<Date>`date_trunc('day', scroll_batches.committed_at)`.as(
        'day_start'
      ),
      total_commit_count_per_day: count(scrollBatches.id),
    })
    .from(scrollBatches)
    .where(
      gt(
        scrollBatches.committed_at,
        sql`CURRENT_DATE - INTERVAL '${sql.raw(days.toString())} days'`
      )
    )
    .groupBy(sql`day_start`)
    .orderBy(sql`day_start`)
}

export async function getCommitCountPerSecond(days: number) {
  const res = await totalCommitCountPerDay(days)

  return normalizeChartData(res, {
    getLabel: (value) => value.day_start,
    datasets: { data: (value) => value.total_commit_count_per_day },
  })
}
