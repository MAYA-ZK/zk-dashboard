import { count, desc, eq } from 'drizzle-orm'

import {
  scrollBatchReceipts,
  scrollBatches,
} from '@zk-dashboard/common/database/schema'
import { db } from '@zk-dashboard/common/database/utils'

export async function getBatchesCount() {
  const results = await db
    .select({ count: count() })
    .from(scrollBatches)
    .execute()

  return results[0].count
}

export async function getBatches(page: number = 1, per_page: number = 10) {
  return await db
    .select()
    .from(scrollBatches)
    .orderBy(desc(scrollBatches.number))
    .leftJoin(
      scrollBatchReceipts,
      eq(scrollBatches.id, scrollBatchReceipts.batch_id)
    )
    .limit(per_page)
    .offset((page - 1) * per_page)
    .execute()
}
