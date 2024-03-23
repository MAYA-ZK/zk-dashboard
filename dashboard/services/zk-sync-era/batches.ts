import { count, desc } from 'drizzle-orm'

import {
  zkSyncEraBatchCostMv,
  zkSyncEraBatchFinalityMv,
} from '@zk-dashboard/common/database/materialized-view/zk-sync-era'
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
      batchNum: zkSyncEraBatchCostMv.batch_num,
      totalTxCount: zkSyncEraBatchCostMv.total_tx_count,
      estCommitCostUsd: zkSyncEraBatchCostMv.est_commit_cost_usd,
      estVerificationCostUsd: zkSyncEraBatchCostMv.est_verification_cost_usd,
      estBatchTotalCostUsd: zkSyncEraBatchCostMv.est_batch_total_cost_usd,
      batchStatus: zkSyncEraBatchCostMv.batch_status,
      batchLink: zkSyncEraBatchCostMv.batch_link,
    })
    .from(zkSyncEraBatchCostMv)
    .orderBy(desc(zkSyncEraBatchCostMv.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesCount() {
  const results = await db
    .select({ count: count() })
    .from(zkSyncEraBatchCostMv)
    .execute()

  return results[0].count
}

export async function getBatchesFinality(
  page: number = 1,
  pageSize: number = 10
) {
  return await db
    .select({
      batchNum: zkSyncEraBatchFinalityMv.batch_num,
      batchCreated: zkSyncEraBatchFinalityMv.batch_created,
      batchCommitted: zkSyncEraBatchFinalityMv.batch_committed,
      batchVerified: zkSyncEraBatchFinalityMv.batch_verified,
      batchStatus: zkSyncEraBatchFinalityMv.batch_status,
      batchLink: zkSyncEraBatchFinalityMv.batch_link,
    })
    .from(zkSyncEraBatchFinalityMv)
    .orderBy(desc(zkSyncEraBatchFinalityMv.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesFinalityCount() {
  const results = await db
    .select({ count: count() })
    .from(zkSyncEraBatchFinalityMv)
    .execute()

  return results[0].count
}
