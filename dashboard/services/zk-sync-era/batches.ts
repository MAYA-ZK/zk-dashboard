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
    .select()
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
      batch_num: zkSyncEraBatchFinalityMv.batch_num,
      batch_created: zkSyncEraBatchFinalityMv.batch_created,
      batch_committed: zkSyncEraBatchFinalityMv.batch_committed,
      batch_verified: zkSyncEraBatchFinalityMv.batch_verified,
      batch_status: zkSyncEraBatchFinalityMv.batch_status,
      batch_link: zkSyncEraBatchFinalityMv.batch_link,
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
