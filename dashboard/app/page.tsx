'use client'

import { cn } from '@nextui-org/react'
import { Tab, Tabs } from '@nextui-org/react'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/table'

const columns = [
  {
    key: 'blockchain',
    label: 'Blockchain',
  },
  {
    key: 'avg_num_stored_txs',
    label: 'Avg. # of stored txs',
  },
  {
    key: 'avg_data_availability_cost',
    label: 'Avg. DA cost',
  },
  {
    key: 'avg_data_availability_update_time',
    label: 'Avg. DA update time',
  },
]

const rows = [
  {
    key: '1',
    blockchain: 'Scroll',
    avg_num_stored_txs: 10,
    avg_data_availability_cost: '$4',
    avg_data_availability_update_time: '4 mins',
  },
  {
    key: '2',
    blockchain: 'zkSync Era',
    avg_num_stored_txs: 10,
    avg_data_availability_cost: '$4',
    avg_data_availability_update_time: '4 mins',
  },
  {
    key: '3',
    blockchain: 'Polygon zkEVM',
    avg_num_stored_txs: 10,
    avg_data_availability_cost: '$4',
    avg_data_availability_update_time: '4 mins',
  },
]

export default function Home() {
  return (
    <main className="flex h-full grow flex-col items-center gap-8 p-5 pt-24 md:p-10">
      <p className="py-24">Maya ZK Dashboard Hero Section</p>

      <div className="h-unit-8xl w-full rounded-md bg-content1 p-8">
        <div className="flex w-full justify-between pb-12">
          <div>
            <p className="text-sm font-semibold">Table subheadline</p>
            <p className="text-4xl font-semibold">Table Headline</p>
          </div>
          <Tabs aria-label="Options" variant="light">
            <Tab key="1day" title="7 days" />
            <Tab key="7days" title="30 days" />
            <Tab key="30days" title="90 days" />
          </Tabs>
        </div>

        <Table
          classNames={{
            wrapper: cn('rounded-none shadow-none'),
          }}
          aria-label="Table description"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={rows}>
            {(item) => (
              <TableRow
                className="overflow-hidden rounded-md hover:bg-primary/50"
                key={item.key}
              >
                {(columnKey) => (
                  <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
