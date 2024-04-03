import { count, desc, sql } from 'drizzle-orm'

import { polygonZkEvmBatchDetailsMv } from '@zk-dashboard/common/database/materialized-view/polygon-zk-evm'
import { db } from '@zk-dashboard/common/database/utils'

export type GetBatchesCostsBreakdownReturnType = Awaited<
  ReturnType<typeof getBatchesCostsBreakdown>
>
export type GetFinalityTimeReturnType = Awaited<
  ReturnType<typeof getFinalityTime>
>

const blockchain = sql<string>`'Polygon zkEvm'`

export async function getBatchesCostsBreakdown(
  page: number = 1,
  pageSize: number = 10
) {
  return await db
    .select({
      blockchain: blockchain,
      batchNum: polygonZkEvmBatchDetailsMv.batch_num,
      batchStatus: polygonZkEvmBatchDetailsMv.batch_status,
      batchLink: polygonZkEvmBatchDetailsMv.batch_link,
      batchSize: polygonZkEvmBatchDetailsMv.batch_size,
      sequenceCost: {
        usd: polygonZkEvmBatchDetailsMv.sequence_cost_usd,
        eth: polygonZkEvmBatchDetailsMv.sequence_cost_eth,
      },
      verificationCost: {
        usd: polygonZkEvmBatchDetailsMv.verification_cost_usd,
        eth: polygonZkEvmBatchDetailsMv.verification_cost_eth,
      },
      finalityCost: {
        usd: polygonZkEvmBatchDetailsMv.finality_cost_usd,
        eth: polygonZkEvmBatchDetailsMv.finality_cost_eth,
      },
      dividedVerificationCost: {
        usd: polygonZkEvmBatchDetailsMv.divided_verification_cost_usd,
        eth: polygonZkEvmBatchDetailsMv.divided_verification_cost_eth,
      },
    })
    .from(polygonZkEvmBatchDetailsMv)
    .orderBy(desc(polygonZkEvmBatchDetailsMv.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesCostsBreakdownCount() {
  const results = await db
    .select({ count: count() })
    .from(polygonZkEvmBatchDetailsMv)
    .execute()

  return results[0].count
}

export async function getFinalityTime(page: number = 1, pageSize: number = 10) {
  return await db
    .select({
      blockchain: blockchain,
      batchNum: polygonZkEvmBatchDetailsMv.batch_num,
      batchStatus: polygonZkEvmBatchDetailsMv.batch_status,
      batchLink: polygonZkEvmBatchDetailsMv.batch_link,
      createdAt: polygonZkEvmBatchDetailsMv.created_at,
      sequencedAt: polygonZkEvmBatchDetailsMv.sequenced_at,
      verifiedAt: polygonZkEvmBatchDetailsMv.verified_at,
      createdToVerifiedDuration:
        polygonZkEvmBatchDetailsMv.created_to_verified_duration,
    })
    .from(polygonZkEvmBatchDetailsMv)
    .orderBy(desc(polygonZkEvmBatchDetailsMv.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getFinalityTimeCount() {
  const results = await db
    .select({ count: count() })
    .from(polygonZkEvmBatchDetailsMv)
    .execute()

  return results[0].count
}
