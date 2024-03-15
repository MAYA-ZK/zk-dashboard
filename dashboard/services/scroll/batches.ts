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
    .select()
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
      batch_num: scrollBatchFinalityMv.batch_num,
      batch_created: scrollBatchFinalityMv.batch_created,
      batch_committed: scrollBatchFinalityMv.batch_committed,
      batch_verified: scrollBatchFinalityMv.batch_verified,
      batch_status: scrollBatchFinalityMv.batch_status,
      batch_link: scrollBatchFinalityMv.batch_link,
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
