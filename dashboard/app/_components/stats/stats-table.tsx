import {
  normalizePolygonZkEvmStats,
  normalizeScrollStats,
  normalizeZkSyncEraStats,
} from '@/app/_components/formatters'
import { StatsTableInteractive } from '@/app/_components/stats/stats-table-interactive'
import { getPolygonZkEvmStats } from '@/services/polygon-zk-evm/stats'
import { getScrollStats } from '@/services/scroll/stats'
import { getZkSyncEraStats } from '@/services/zk-sync-era/stats'

const getNormalizedStats = async () => {
  const [polygonZkEvmStats, scrollStats, zkSyncEraStats] = await Promise.all([
    getPolygonZkEvmStats(),
    getScrollStats(),
    getZkSyncEraStats(),
  ])

  const normalizedPolygonZkEvmStats =
    normalizePolygonZkEvmStats(polygonZkEvmStats)
  const normalizedScrollStats = normalizeScrollStats(scrollStats)
  const normalizedZkSyncEraStats = normalizeZkSyncEraStats(zkSyncEraStats)

  return {
    polygonZkEvmStats: normalizedPolygonZkEvmStats,
    scrollStats: normalizedScrollStats,
    zkSyncEraStats: normalizedZkSyncEraStats,
  }
}
export async function StatsTable() {
  const { polygonZkEvmStats, scrollStats, zkSyncEraStats } =
    await getNormalizedStats()

  return (
    <StatsTableInteractive
      data={[polygonZkEvmStats, scrollStats, zkSyncEraStats]}
    />
  )
}
