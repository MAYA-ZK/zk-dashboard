import { getBatches, getBatchesCount } from '@/services/scroll/batches'
import { Card, CardBody, CardHeader } from '@nextui-org/card'
import { z } from 'zod'

import { getEthLastPrice } from '@zk-dashboard/common/integrations/etherscan'

import { BatchesTable } from './table'

const ITEMS_PER_PAGE = 20

export default async function Page(props: { searchParams: { page?: string } }) {
  const parsedSearchParams = z
    .object({
      page: z.coerce.number().optional(),
    })
    .safeParse(props.searchParams)

  const page =
    parsedSearchParams.success && parsedSearchParams.data.page
      ? parsedSearchParams.data.page
      : 1

  const data = await getBatches(page, ITEMS_PER_PAGE)
  const count = await getBatchesCount()
  const pages = Math.ceil(count / ITEMS_PER_PAGE)
  const { ethusd } = await getEthLastPrice()

  const batches = data.map((item) => {
    const batch = item.scroll_batches

    const pricePerBatch =
      parseFloat(item.scroll_batch_receipts?.total_tx_effective_price ?? '0') *
      ethusd
    const pricePerTx =
      parseFloat(
        item.scroll_batch_receipts?.total_tx_effective_unit_price ?? '0'
      ) * ethusd
    return { ...batch, pricePerBatch, pricePerTx }
  })

  return (
    <Card className="size-full">
      <CardHeader className="flex-col items-start">
        <h4 className="text-large font-bold">Batches</h4>
      </CardHeader>
      <CardBody>
        <BatchesTable
          page={page}
          pages={pages}
          batches={batches}
          className="h-full"
        />
      </CardBody>
    </Card>
  )
}
