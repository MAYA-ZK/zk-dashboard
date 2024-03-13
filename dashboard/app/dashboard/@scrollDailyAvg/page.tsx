import { DailyCreatedBatchesWithAverage } from '@/app/dashboard/@scrollDailyAvg/chart'

export default async function Page() {
  return (
    <div className="h-unit-8xl w-full rounded-md bg-content1 p-8">
      <h2 className="text-center">
        Batches that are created daily with the average number of transactions
        per batch
      </h2>
      <DailyCreatedBatchesWithAverage />
    </div>
  )
}
