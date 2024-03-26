import { TableCell, TableRow } from '@/components/ui/table'
import Image from 'next/image'

export function ComingSoonRow({
  logo,
  blockchain,
}: {
  logo: string
  blockchain: string
}) {
  return (
    <TableRow>
      <TableCell className="flex gap-2">
        <div className="flex size-5 items-center">
          <Image
            src={logo}
            alt={`${blockchain}-logo`}
            width={10}
            height={10}
            className="size-auto"
          />
        </div>
        {blockchain}
      </TableCell>
      <TableCell colSpan={5}>Coming soon...</TableCell>
    </TableRow>
  )
}
