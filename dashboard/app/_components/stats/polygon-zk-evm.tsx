import {
  ETH_DECIMALS_TO_DISPLAY,
  USD_DECIMALS_TO_DISPLAY,
} from '@/app/_components/constants'
import { StatsRow } from '@/app/_components/stats-row'
import { routes } from '@/config/routes'
import { formatStringNumber } from '@/lib/formatters'
import { getPolygonZkEvmStats } from '@/services/polygon-zk-evm/stats'
import { mapValues } from 'lodash'

export async function PolygonZkEvmStats() {
  const scrollStats = await getPolygonZkEvmStats()

  const normalizedData = mapValues(scrollStats, (value) => {
    return {
      logo: 'polygon-zk-evm-logo.svg',
      blockchain: 'Polygon zkEVM',
      blockchainPath: routes.polygon,
      finality: { value: value.avgFinality },
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
