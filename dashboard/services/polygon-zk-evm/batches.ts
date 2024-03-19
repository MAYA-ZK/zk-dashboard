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
    .select()
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
      batch_num: polygonZkEvmBatchFinalityMv.batch_num,
      batch_created: polygonZkEvmBatchFinalityMv.batch_created,
      batch_committed: polygonZkEvmBatchFinalityMv.batch_committed,
      batch_verified: polygonZkEvmBatchFinalityMv.batch_verified,
      batch_status: polygonZkEvmBatchFinalityMv.batch_status,
      batch_link: polygonZkEvmBatchFinalityMv.batch_link,
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
