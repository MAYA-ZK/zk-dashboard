import { count, desc } from 'drizzle-orm'

import {
  polygonZkEvmBatchCostMv,
  polygonZkEvmBatchFinalityMv,
} from '@zk-dashboard/common/database/materialized-view/polygon-zk-evm'
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
      batchNum: polygonZkEvmBatchCostMv.batch_num,
      totalTxCount: polygonZkEvmBatchCostMv.total_tx_count,
      estCommitCostUsd: polygonZkEvmBatchCostMv.est_commit_cost_usd,
      estVerificationCostUsd: polygonZkEvmBatchCostMv.est_verification_cost_usd,
      estBatchTotalCostUsd: polygonZkEvmBatchCostMv.est_batch_total_cost_usd,
      batchStatus: polygonZkEvmBatchCostMv.batch_status,
      batchLink: polygonZkEvmBatchCostMv.batch_link,
    })
    .from(polygonZkEvmBatchCostMv)
    .orderBy(desc(polygonZkEvmBatchCostMv.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesCount() {
  const results = await db
    .select({ count: count() })
    .from(polygonZkEvmBatchCostMv)
    .execute()

  return results[0].count
}

export async function getBatchesFinality(
  page: number = 1,
  pageSize: number = 10
) {
  return await db
    .select({
      batchNum: polygonZkEvmBatchFinalityMv.batch_num,
      batchCreated: polygonZkEvmBatchFinalityMv.batch_created,
      batchCommitted: polygonZkEvmBatchFinalityMv.batch_committed,
      batchVerified: polygonZkEvmBatchFinalityMv.batch_verified,
      batchStatus: polygonZkEvmBatchFinalityMv.batch_status,
      batchLink: polygonZkEvmBatchFinalityMv.batch_link,
    })
    .from(polygonZkEvmBatchFinalityMv)
    .orderBy(desc(polygonZkEvmBatchFinalityMv.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesFinalityCount() {
  const results = await db
    .select({ count: count() })
    .from(polygonZkEvmBatchFinalityMv)
    .execute()

  return results[0].count
}
