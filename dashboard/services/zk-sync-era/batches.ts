import { count, desc, sql } from 'drizzle-orm'

import { zkSyncEraBatchDetailsMv } from '@zk-dashboard/common/database/materialized-view/zk-sync-era'
import { db } from '@zk-dashboard/common/database/utils'

export type GetBatchesCostsBreakdownReturnType = Awaited<
  ReturnType<typeof getBatchesCostsBreakdown>
>
export type GetFinalityTimeReturnType = Awaited<
  ReturnType<typeof getFinalityTime>
>

const blockchain = sql<string>`'zkSync Era'`

export async function getBatchesCostsBreakdown(
  page: number = 1,
  pageSize: number = 10
) {
  return await db
    .select({
      blockchain: blockchain,
      batchNum: zkSyncEraBatchDetailsMv.batch_num,
      batchStatus: zkSyncEraBatchDetailsMv.batch_status,
      batchLink: zkSyncEraBatchDetailsMv.batch_link,
      batchSize: zkSyncEraBatchDetailsMv.batch_size,
      commitCost: {
        usd: zkSyncEraBatchDetailsMv.commit_cost_usd,
        eth: zkSyncEraBatchDetailsMv.commit_cost_usd,
      },
      proveCost: {
        usd: zkSyncEraBatchDetailsMv.prove_cost_usd,
        eth: zkSyncEraBatchDetailsMv.prove_cost_eth,
      },
      executeCost: {
        usd: zkSyncEraBatchDetailsMv.execute_cost_usd,
        eth: zkSyncEraBatchDetailsMv.execute_cost_eth,
      },
      finalityCost: {
        usd: zkSyncEraBatchDetailsMv.finality_cost_usd,
        eth: zkSyncEraBatchDetailsMv.finality_cost_eth,
      },
      dividedExecuteCost: {
        usd: zkSyncEraBatchDetailsMv.divided_execute_cost_usd,
        eth: zkSyncEraBatchDetailsMv.divided_execute_cost_eth,
      },
    })
    .from(zkSyncEraBatchDetailsMv)
    .orderBy(desc(zkSyncEraBatchDetailsMv.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesCostsBreakdownCount() {
  const results = await db
    .select({ count: count() })
    .from(zkSyncEraBatchDetailsMv)
    .execute()

  return results[0].count
}

export async function getFinalityTime(page: number = 1, pageSize: number = 10) {
  return await db
    .select({
      blockchain: blockchain,
      batchNum: zkSyncEraBatchDetailsMv.batch_num,
      batchStatus: zkSyncEraBatchDetailsMv.batch_status,
      batchLink: zkSyncEraBatchDetailsMv.batch_link,
      createdAt: zkSyncEraBatchDetailsMv.created_at,
      committedAt: zkSyncEraBatchDetailsMv.committed_at,
      provenAt: zkSyncEraBatchDetailsMv.proven_at,
      executedAt: zkSyncEraBatchDetailsMv.executed_at,
      createdToExecutedDuration:
        zkSyncEraBatchDetailsMv.created_to_executed_duration,
      createdToProvenDuration:
        zkSyncEraBatchDetailsMv.created_to_proven_duration,
    })
    .from(zkSyncEraBatchDetailsMv)
    .orderBy(desc(zkSyncEraBatchDetailsMv.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getFinalityTimeCount() {
  const results = await db
    .select({ count: count() })
    .from(zkSyncEraBatchDetailsMv)
    .execute()

  return results[0].count
}
