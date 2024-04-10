import { count, desc } from 'drizzle-orm'

import { zkSyncEraBatchDetails } from '@zk-dashboard/common/database/materialized-view/zk-sync-era'
import { db } from '@zk-dashboard/common/database/utils'

export type GetBatchesCostsBreakdownReturnType = Awaited<
  ReturnType<typeof getBatchesCostsBreakdown>
>
export type GetFinalityTimeReturnType = Awaited<
  ReturnType<typeof getFinalityTime>
>

export async function getBatchesCostsBreakdown(
  page: number = 1,
  pageSize: number = 10
) {
  return await db
    .select({
      batchNum: zkSyncEraBatchDetails.batch_num,
      batchStatus: zkSyncEraBatchDetails.batch_status,
      batchLink: zkSyncEraBatchDetails.batch_link,
      batchSize: zkSyncEraBatchDetails.batch_size,
      commitCost: {
        usd: zkSyncEraBatchDetails.commit_cost_usd,
        eth: zkSyncEraBatchDetails.commit_cost_eth,
      },
      proveCost: {
        usd: zkSyncEraBatchDetails.prove_cost_usd,
        eth: zkSyncEraBatchDetails.prove_cost_eth,
      },
      executeCost: {
        usd: zkSyncEraBatchDetails.execute_cost_usd,
        eth: zkSyncEraBatchDetails.execute_cost_eth,
      },
      finalityCost: {
        usd: zkSyncEraBatchDetails.finality_cost_usd,
        eth: zkSyncEraBatchDetails.finality_cost_eth,
      },
      dividedExecuteCost: {
        usd: zkSyncEraBatchDetails.divided_execute_cost_usd,
        eth: zkSyncEraBatchDetails.divided_execute_cost_eth,
      },
    })
    .from(zkSyncEraBatchDetails)
    .orderBy(desc(zkSyncEraBatchDetails.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesCostsBreakdownCount() {
  const results = await db
    .select({ count: count() })
    .from(zkSyncEraBatchDetails)
    .execute()

  return results[0].count
}

export async function getFinalityTime(page: number = 1, pageSize: number = 10) {
  return await db
    .select({
      batchNum: zkSyncEraBatchDetails.batch_num,
      batchStatus: zkSyncEraBatchDetails.batch_status,
      batchLink: zkSyncEraBatchDetails.batch_link,
      createdAt: zkSyncEraBatchDetails.created_at,
      committedAt: zkSyncEraBatchDetails.committed_at,
      provenAt: zkSyncEraBatchDetails.proven_at,
      executedAt: zkSyncEraBatchDetails.executed_at,
      createdToExecutedDuration:
        zkSyncEraBatchDetails.created_to_executed_duration,
      createdToProvenDuration: zkSyncEraBatchDetails.created_to_proven_duration,
    })
    .from(zkSyncEraBatchDetails)
    .orderBy(desc(zkSyncEraBatchDetails.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getFinalityTimeCount() {
  const results = await db
    .select({ count: count() })
    .from(zkSyncEraBatchDetails)
    .execute()

  return results[0].count
}
