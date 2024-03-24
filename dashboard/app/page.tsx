import { CurrencyToggle } from '@/app/_components/currency-toggle'
import { InfoTooltip } from '@/app/_components/info-tooltip'
import { PeriodToggle } from '@/app/_components/period-toggle'
import { PolygonZkEvmStats } from '@/app/_components/stats/polygon-zk-evm'
import { ScrollStats } from '@/app/_components/stats/scroll'
import { ZkSynEraStats } from '@/app/_components/stats/zk-sync-era.tsx'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function Home() {
  return (
    <main className="flex size-full grow flex-col items-center justify-center">
      <div className="flex w-full flex-col gap-10 rounded-md bg-background px-9 py-7">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-semibold uppercase">ZK-Rollups</h3>
            <h2 className="text-4xl font-semibold">Finality and Costs</h2>
          </div>
          <div className="flex items-center">
            <PeriodToggle />
            <span className="px-4">-</span>
            <CurrencyToggle />
          </div>
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHead className="w-2/12 text-nowrap">Blockchain</TableHead>
                <TableHead className="w-1/12 text-nowrap">
                  Finality
                  <InfoTooltip
                    content="Average time from when a batch is created on L2 to its verification on L1 within the selected period."
                    className="ml-1.5"
                  />
                </TableHead>
                <TableHead className="w-3/12 text-nowrap">
                  Finality (Normalized)
                  <InfoTooltip
                    content="Average finality time, adjusted for batches containing exactly 100 transactions, over the selected period."
                    className="ml-1.5"
                  />
                </TableHead>
                <TableHead className="w-1/12 text-nowrap">
                  Batch size
                  <InfoTooltip
                    content="Average number of transactions per batch on L2, calculated over the selected date range."
                    className="ml-1.5"
                  />
                </TableHead>
                <TableHead className="w-2/12 text-nowrap">
                  Batch cost
                  <InfoTooltip
                    content="Average cost incurred for confirming L2 state updates on L1, calculated over the selected date range."
                    className="ml-1.5"
                  />
                </TableHead>
                <TableHead className="w-3/12 text-nowrap">
                  Batch cost (Normalized)
                  <InfoTooltip
                    content="Average L1 confirmation cost, adjusted for batches of 100 transactions, over the selected period."
                    className="ml-1.5"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <ScrollStats />
              <ZkSynEraStats />
              <PolygonZkEvmStats />
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  )
}
