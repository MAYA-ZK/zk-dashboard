import {
  normalizeLineaStats,
  normalizePolygonZkEvmStats,
  normalizeScrollStats,
  normalizeZkSyncEraStats,
} from '@/app/_components/formatters'
import { StatsTableInteractive } from '@/app/_components/stats/stats-table-interactive'
import { getLineaStats } from '@/services/linea/stats'
import { getPolygonZkEvmStats } from '@/services/polygon-zk-evm/stats'
import { getScrollStats } from '@/services/scroll/stats'
import { getZkSyncEraStats } from '@/services/zk-sync-era/stats'

const getNormalizedStats = async () => {
  const [polygonZkEvmStats, scrollStats, zkSyncEraStats, lineaStats] =
    await Promise.all([
      getPolygonZkEvmStats(),
      getScrollStats(),
      getZkSyncEraStats(),
      getLineaStats(),
    ])

  const normalizedPolygonZkEvmStats =
    normalizePolygonZkEvmStats(polygonZkEvmStats)
  const normalizedScrollStats = normalizeScrollStats(scrollStats)
  const normalizedZkSyncEraStats = normalizeZkSyncEraStats(zkSyncEraStats)
  const normalizedLineaStats = normalizeLineaStats(lineaStats)

  return {
    polygonZkEvmStats: normalizedPolygonZkEvmStats,
    scrollStats: normalizedScrollStats,
    zkSyncEraStats: normalizedZkSyncEraStats,
    lineaStats: normalizedLineaStats,
  }
}
export async function StatsTable() {
  const { polygonZkEvmStats, scrollStats, zkSyncEraStats, lineaStats } =
    await getNormalizedStats()

  return (
    <StatsTableInteractive
      data={[polygonZkEvmStats, scrollStats, zkSyncEraStats, lineaStats]}
    />
  )
}
