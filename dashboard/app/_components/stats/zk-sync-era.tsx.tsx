import {
  ETH_DECIMALS_TO_DISPLAY,
  USD_DECIMALS_TO_DISPLAY,
} from '@/app/_components/constants'
import { StatsRow } from '@/app/_components/stats-row'
import { formatStringNumber } from '@/lib/formatters'
import { getZkSyncEraStats } from '@/services/zk-sync-era/stats'
import { mapValues } from 'lodash'

export async function ZkSynEraStats() {
  const stats = await getZkSyncEraStats()

  const normalizedData = mapValues(stats, (value) => {
    return {
      logo: 'zk-sync-era-logo.svg',
      blockchain: 'ZK Sync Era',
      finality: {
        value: value.avgFinality,
        additionalInfo: [
          { label: 'Total time for finality', value: value.avgExecution },
        ],
      },
      finalityNormalized: value.avgDurationBy100,
      batchSize: value.avgTxsInsideBatch,
      batchCost: {
        usd: formatStringNumber(value.avgTotalCostUsd, USD_DECIMALS_TO_DISPLAY),
        eth: formatStringNumber(value.avgTotalCostEth, ETH_DECIMALS_TO_DISPLAY),
        breakdown: {
          commitCost: {
            usd: formatStringNumber(
              value.avgCommitCostUsd,
              USD_DECIMALS_TO_DISPLAY
            ),
            eth: formatStringNumber(
              value.avgCommitCostEth,
              ETH_DECIMALS_TO_DISPLAY
            ),
            label: 'Commit cost',
          },
          verifyCost: {
            usd: formatStringNumber(
              value.avgVerifyCostUsd,
              USD_DECIMALS_TO_DISPLAY
            ),
            eth: formatStringNumber(
              value.avgVerifyCostEth,
              ETH_DECIMALS_TO_DISPLAY
            ),
            label: 'Verify cost',
          },
          execute: {
            usd: formatStringNumber(
              value.avgExecuteCostUsd,
              USD_DECIMALS_TO_DISPLAY
            ),
            eth: formatStringNumber(
              value.avgExecuteCostEth,
              ETH_DECIMALS_TO_DISPLAY
            ),
            label: 'Execute cost',
          },
        },
      },
      batchCostNormalized: {
        usd: formatStringNumber(
          value.avgTotalUsdCostBy100,
          USD_DECIMALS_TO_DISPLAY
        ),
        eth: formatStringNumber(
          value.avgTotalEthCostBy100,
          ETH_DECIMALS_TO_DISPLAY
        ),
        breakdown: {
          provingCost: {
            usd: formatStringNumber(
              value.avgTxsCostUsd,
              USD_DECIMALS_TO_DISPLAY
            ),
            eth: formatStringNumber(
              value.avgTxsCostEth,
              ETH_DECIMALS_TO_DISPLAY
            ),
            label: 'Proving cost',
          },
        },
      },
    }
  })

  return <StatsRow data={normalizedData} />
}
