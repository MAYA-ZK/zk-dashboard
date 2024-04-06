import { count, desc, sql } from 'drizzle-orm'

import { scrollBatchDetails } from '@zk-dashboard/common/database/materialized-view/scroll'
import { db } from '@zk-dashboard/common/database/utils'

export type GetBatchesCostsBreakdownReturnType = Awaited<
  ReturnType<typeof getBatchesCostsBreakdown>
>
export type GetFinalityTimeReturnType = Awaited<
  ReturnType<typeof getFinalityTime>
>

const blockchain = sql<string>`'Scroll'`

export async function getBatchesCostsBreakdown(
  page: number = 1,
  pageSize: number = 10
) {
  return await db
    .select({
      blockchain,
      batchNum: scrollBatchDetails.batch_num,
      batchStatus: scrollBatchDetails.batch_status,
      batchLink: scrollBatchDetails.batch_link,
      batchSize: scrollBatchDetails.batch_size,
      commitCost: {
        usd: scrollBatchDetails.commit_cost_usd,
        eth: scrollBatchDetails.commit_cost_eth,
      },
      finalityCost: {
        usd: scrollBatchDetails.finality_cost_usd,
        eth: scrollBatchDetails.finality_cost_eth,
      },
    })
    .from(scrollBatchDetails)
    .orderBy(desc(scrollBatchDetails.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesCostsBreakdownCount() {
  const results = await db
    .select({ count: count() })
    .from(scrollBatchDetails)
    .execute()

  return results[0].count
}

export async function getFinalityTime(page: number = 1, pageSize: number = 10) {
  return await db
    .select({
      blockchain,
      batchNum: scrollBatchDetails.batch_num,
      batchStatus: scrollBatchDetails.batch_status,
      batchLink: scrollBatchDetails.batch_link,
      createdAt: scrollBatchDetails.created_at,
      committedAt: scrollBatchDetails.committed_at,
      finalizedAt: scrollBatchDetails.finalized_at,
      createdToFinalizedDuration:
        scrollBatchDetails.created_to_finalized_duration,
    })
    .from(scrollBatchDetails)
    .orderBy(desc(scrollBatchDetails.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getFinalityTimeCount() {
  const results = await db
    .select({ count: count() })
    .from(scrollBatchDetails)
    .execute()

  return results[0].count
}
