import {
  ETH_DECIMALS_TO_DISPLAY,
  USD_DECIMALS_TO_DISPLAY,
} from '@/app/_components/constants'
import { routes } from '@/config/routes'
import { formatStringNumber } from '@/lib/formatters'
import type { PolygonZkEvmStats } from '@/services/polygon-zk-evm/stats'
import type { ScrollStats } from '@/services/scroll/stats'
import type { ZkSyncEraStats } from '@/services/zk-sync-era/stats'
import { mapValues } from 'lodash'
import 'server-only'

export function normalizePolygonZkEvmStats(stats: PolygonZkEvmStats) {
  return mapValues(stats, (value) => {
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
}

export function normalizeScrollStats(stats: ScrollStats) {
  return mapValues(stats, (value) => {
    return {
      logo: 'scroll-logo.svg',
      blockchain: 'Scroll',
      blockchainPath: routes.scroll,
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
}

export function normalizeZkSyncEraStats(stats: ZkSyncEraStats) {
  return mapValues(stats, (value) => {
    return {
      logo: 'zk-sync-era-logo.svg',
      blockchain: 'ZK Sync Era',
      blockchainPath: routes.zkSync,
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
}
