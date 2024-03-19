import { BatchesAvgCost } from './chart'

export default async function Page() {
  return (
    <div className="h-unit-8xl w-full rounded-md bg-content1 p-8">
      <h2 className="text-center">Batch cost</h2>
      <BatchesAvgCost />
    </div>
  )
}
