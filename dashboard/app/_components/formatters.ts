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
      finality: { value: value.avgFinalizationTime },
      finalityNormalized: value.normalizedBatchSizeBy100Finality,
      batchSize: value.avgBatchSize,
      batchCost: {
        usd: formatStringNumber(
          value.avgFinalityCostUsd,
          USD_DECIMALS_TO_DISPLAY
        ),
        eth: formatStringNumber(
          value.avgFinalityCostEth,
          ETH_DECIMALS_TO_DISPLAY
        ),
      },
      batchCostNormalized: {
        usd: formatStringNumber(
          value.normalizedBatchSizeBy100CostUsd,
          USD_DECIMALS_TO_DISPLAY
        ),
        eth: formatStringNumber(
          value.normalizedBatchSizeBy100CostEth,
          ETH_DECIMALS_TO_DISPLAY
        ),
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
      finality: { value: value.avgFinalizationTime },
      finalityNormalized: value.normalizedBatchSizeBy100Finality,
      batchSize: value.avgBatchSize,
      batchCost: {
        usd: formatStringNumber(
          value.avgFinalityCostUsd,
          USD_DECIMALS_TO_DISPLAY
        ),
        eth: formatStringNumber(
          value.avgFinalityCostEth,
          ETH_DECIMALS_TO_DISPLAY
        ),
      },
      batchCostNormalized: {
        usd: formatStringNumber(
          value.normalizedBatchSizeBy100CostUsd,
          USD_DECIMALS_TO_DISPLAY
        ),
        eth: formatStringNumber(
          value.normalizedBatchSizeBy100CostEth,
          ETH_DECIMALS_TO_DISPLAY
        ),
      },
    }
  })
}

export function normalizeZkSyncEraStats(stats: ZkSyncEraStats) {
  return mapValues(stats, (value) => {
    return {
      logo: 'zk-sync-era-logo.svg',
      blockchain: 'zkSync Era',
      blockchainPath: routes.zkSync,
      finality: {
        value: value.avgFinalizationTime,
        additionalInfo: [
          { label: 'Total time for finality', value: value.avgExecutionTime },
        ],
      },
      finalityNormalized: value.normalizedBatchSizeBy100Finality,
      batchSize: value.avgBatchSize,
      batchCost: {
        usd: formatStringNumber(
          value.avgFinalityCostUsd,
          USD_DECIMALS_TO_DISPLAY
        ),
        eth: formatStringNumber(
          value.avgFinalityCostEth,
          ETH_DECIMALS_TO_DISPLAY
        ),
      },
      batchCostNormalized: {
        usd: formatStringNumber(
          value.normalizedBatchSizeBy100CostUsd,
          USD_DECIMALS_TO_DISPLAY
        ),
        eth: formatStringNumber(
          value.normalizedBatchSizeBy100CostEth,
          ETH_DECIMALS_TO_DISPLAY
        ),
      },
    }
  })
}