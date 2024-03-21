import { StatsTable } from '@/components/table/stats-table'
import { getPolygonZkEvmStats } from '@/services/polygon-zk-evm/stats'
import { getScrollStats } from '@/services/scroll/stats'
import { getzkSyncEraStats } from '@/services/zk-sync-era/stats'

const columns = [
  {
    key: 'blockchain',
    label: 'Blockchain',
  },
  {
    key: 'avgFinality',
    label: 'Avg. Batch Proving time',
  },
  {
    key: 'avgDurationBy100',
    label: 'Avg. Proving time for 100txs',
  },
  {
    key: 'avgTxsInsideBatch',
    label: 'Avg. Txs per Batch',
  },
  {
    key: 'avgTotalCost',
    label: 'Avg. Batch Proving Cost',
  },
  {
    key: 'avgTotalCostBy100',
    label: 'Avg. Proving Cost for 100txs',
  },
]

export default async function Home() {
  const scrollStats = await getScrollStats()
  const zkSyncStats = await getzkSyncEraStats()
  const polygonStats = await getPolygonZkEvmStats()

  const stats = {
    scroll: scrollStats,
    zkSync: zkSyncStats,
    polygon: polygonStats,
  }

  return (
    <main className="flex h-full grow flex-col items-center gap-8 p-5 pt-24 md:p-10">
      <p className="py-24">Maya ZK Dashboard Hero Section</p>

      <StatsTable columns={columns} stats={stats} />
    </main>
  )
}
