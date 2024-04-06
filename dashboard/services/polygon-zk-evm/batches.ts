import { count, desc, sql } from 'drizzle-orm'

import { polygonZkEvmBatchDetails } from '@zk-dashboard/common/database/materialized-view/polygon-zk-evm'
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
      batchNum: polygonZkEvmBatchDetails.batch_num,
      batchStatus: polygonZkEvmBatchDetails.batch_status,
      batchLink: polygonZkEvmBatchDetails.batch_link,
      batchSize: polygonZkEvmBatchDetails.batch_size,
      sequenceCost: {
        usd: polygonZkEvmBatchDetails.sequence_cost_usd,
        eth: polygonZkEvmBatchDetails.sequence_cost_eth,
      },
      verificationCost: {
        usd: polygonZkEvmBatchDetails.verification_cost_usd,
        eth: polygonZkEvmBatchDetails.verification_cost_eth,
      },
      finalityCost: {
        usd: polygonZkEvmBatchDetails.finality_cost_usd,
        eth: polygonZkEvmBatchDetails.finality_cost_eth,
      },
      dividedVerificationCost: {
        usd: polygonZkEvmBatchDetails.divided_verification_cost_usd,
        eth: polygonZkEvmBatchDetails.divided_verification_cost_eth,
      },
    })
    .from(polygonZkEvmBatchDetails)
    .orderBy(desc(polygonZkEvmBatchDetails.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getBatchesCostsBreakdownCount() {
  const results = await db
    .select({ count: count() })
    .from(polygonZkEvmBatchDetails)
    .execute()

  return results[0].count
}

export async function getFinalityTime(page: number = 1, pageSize: number = 10) {
  return await db
    .select({
      blockchain: blockchain,
      batchNum: polygonZkEvmBatchDetails.batch_num,
      batchStatus: polygonZkEvmBatchDetails.batch_status,
      batchLink: polygonZkEvmBatchDetails.batch_link,
      createdAt: polygonZkEvmBatchDetails.created_at,
      sequencedAt: polygonZkEvmBatchDetails.sequenced_at,
      verifiedAt: polygonZkEvmBatchDetails.verified_at,
      createdToVerifiedDuration:
        polygonZkEvmBatchDetails.created_to_verified_duration,
    })
    .from(polygonZkEvmBatchDetails)
    .orderBy(desc(polygonZkEvmBatchDetails.batch_num))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getFinalityTimeCount() {
  const results = await db
    .select({ count: count() })
    .from(polygonZkEvmBatchDetails)
    .execute()

  return results[0].count
}
