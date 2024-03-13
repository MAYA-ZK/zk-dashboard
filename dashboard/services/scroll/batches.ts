import { count, desc } from 'drizzle-orm'

import { scrollBatchCostMV } from '@zk-dashboard/common/database/materialized-view/scroll'
import { db } from '@zk-dashboard/common/database/utils'

export type GetBatchesCostsReturnType = Awaited<
  ReturnType<typeof getBatchesCosts>
>

export async function getBatchesCount() {
  const results = await db
    .select({ count: count() })
    .from(scrollBatchCostMV)
    .execute()

  return results[0].count
}

export async function getBatchesCosts(page: number = 1, per_page: number = 10) {
  return await db
    .select()
    .from(scrollBatchCostMV)
    .orderBy(desc(scrollBatchCostMV.batch_num))
    .limit(per_page)
    .offset((page - 1) * per_page)
}
