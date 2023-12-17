import { ButtonLink } from '@/components/ui/button-link'
import {
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
} from '@nextui-org/react'
import { Suspense } from 'react'
import { z } from 'zod'

import { TransactionsPerSecondChart } from './chart'

const queryKeyRange = 'tps-range'

const searchParamsSchema = z.object({
  [queryKeyRange]: z.coerce.number().optional().default(7),
})

const ranges = [
  { label: '90 days', value: 90 },
  { label: '30 days', value: 30 },
  { label: '7 days', value: 7 },
  { label: '1 day', value: 1 },
]

export default async function Page({
  searchParams,
}: {
  searchParams: { [queryKeyRange]?: string }
}) {
  const parsedSearchParams = searchParamsSchema.safeParse(searchParams)
  const days = parsedSearchParams.success
    ? parsedSearchParams.data[queryKeyRange]
    : 7

  return (
    <Card className="size-full">
      <CardHeader className="flex-col items-start">
        <h4 className="text-large font-bold">
          Transactions per second for past {days} days
        </h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <div className="flex h-full flex-col items-start gap-4">
          <ButtonGroup>
            {ranges.map(({ label, value }) => (
              <ButtonLink
                href={{
                  query: {
                    ...searchParams,
                    [queryKeyRange]: value,
                  },
                }}
                scroll={false}
                color={days === value ? 'primary' : 'default'}
                key={value}
              >
                {label}
              </ButtonLink>
            ))}
          </ButtonGroup>
          <Suspense fallback={<Skeleton className="size-full" />}>
            <TransactionsPerSecondChart days={days} />
          </Suspense>
        </div>
      </CardBody>
    </Card>
  )
}
