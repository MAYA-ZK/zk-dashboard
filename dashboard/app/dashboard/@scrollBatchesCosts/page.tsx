import { BatchesTable } from '@/app/dashboard/@scrollBatchesCosts/table'
import { getBatchesCosts, getBatchesCount } from '@/services/scroll/batches'

export default async function Page({
  searchParams,
}: {
  searchParams: {
    page?: string
  }
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const batches = await getBatchesCosts(page, 10)

  const batchesCount = await getBatchesCount()
  const pages = Math.ceil(batchesCount / 10)

  return (
    <div className="flex w-full flex-col gap-8 rounded-md bg-content1 p-8">
      <h2 className="text-center">
        Batches that are created daily with the average number of transactions
        per batch
      </h2>
      <BatchesTable batches={batches} page={page} pages={pages} />
    </div>
  )
}
