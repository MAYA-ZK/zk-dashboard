import { count, desc } from 'drizzle-orm'

import {
  scrollBatchCostMV,
  scrollBatchFinalityMv,
} from '@zk-dashboard/common/database/materialized-view/scroll'
import { db } from '@zk-dashboard/common/database/utils'

export type GetBatchesCostsReturnType = Awaited<
  ReturnType<typeof getBatchesCosts>
>
export type GetBatchesFinalityReturnType = Awaited<
  ReturnType<typeof getBatchesFinality>
>

export async function getBatchesCosts(page: number = 1, pageSize: number = 10) {
  return await db
    .select({
      batchNum: scrollBatchCostMV.batch_num,
      totalTxCount: scrollBatchCostMV.total_tx_count,
      estCommitCostUsd: scrollBatchCostMV.est_commit_cost_usd,
      estVerificationCostUsd: scrollBatchCostMV.est_verification_cost_usd,
      estBatchTotalCostUsd: scrollBatchCostMV.est_batch_total_cost_usd,
      batchStatus: scrollBatchCostMV.batch_status,
      batchLink: scrollBatchCostMV.batch_link,
    })
    .from(scrollBatchCostMV)
    .orderBy(desc(scrollBatchCostMV.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesCount() {
  const results = await db
    .select({ count: count() })
    .from(scrollBatchCostMV)
    .execute()

  return results[0].count
}

export async function getBatchesFinality(
  page: number = 1,
  pageSize: number = 10
) {
  return await db
    .select({
      batchNum: scrollBatchFinalityMv.batch_num,
      batchCreated: scrollBatchFinalityMv.batch_created,
      batchCommitted: scrollBatchFinalityMv.batch_committed,
      batchVerified: scrollBatchFinalityMv.batch_verified,
      batchStatus: scrollBatchFinalityMv.batch_status,
      batchLink: scrollBatchFinalityMv.batch_link,
    })
    .from(scrollBatchFinalityMv)
    .orderBy(desc(scrollBatchFinalityMv.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesFinalityCount() {
  const results = await db
    .select({ count: count() })
    .from(scrollBatchFinalityMv)
    .execute()

  return results[0].count
}
