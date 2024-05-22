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
      <TableCell className="flex gap-2 first:sticky first:left-0 first:z-10 first:bg-white">
        <div className="size-5">
          <Image
            src={logo}
            alt={`${blockchain}-logo`}
            width={10}
            height={10}
            className="size-auto"
          />
        </div>
      </TableCell>
      <TableCell className="">{blockchain}</TableCell>
      <TableCell colSpan={5}>Coming soon...</TableCell>
    </TableRow>
  )
}
