'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/react'

const columns = [
  {
    key: 'hash',
    label: 'HASH',
  },
  {
    key: 'transactions',
    label: 'TRANSACTIONS',
  },
  {
    key: 'price',
    label: 'PRICE',
  },
]

const rows = [
  {
    key: '1',
    hash: '0x1...',
    transactions: '143',
    price: '$1,000.00',
  },
  {
    key: '2',
    hash: '0x2...',
    transactions: '82',
    price: '$6,000.00',
  },
  {
    key: '3',
    hash: '0x3...',
    transactions: '69',
    price: '$2,000.00',
  },
]

export function DemoTable() {
  return (
    <Table
      className="max-w-2xl"
      isStriped
      aria-label="Example table with dynamic content"
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn className="uppercase" key={column.key}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={rows}>
        {(item) => (
          <TableRow key={item.key}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
